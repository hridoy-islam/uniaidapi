import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import {studentSearchableFields } from "./student.constant";
import { TStudent } from "./student.interface";
import Student from "./student.model";
import { User } from "../user/user.model";
import mongoose, { Types } from "mongoose";
import CourseRelation from "../course-relation/courseRelation.model";
import Term from "../term/term.model";


const generateRefId = async (): Promise<string> => {
  // Get the last created student sorted by refId in descending order
  const lastStudent = await Student.findOne().sort({ refId: -1 });

  let newRefId = "STD00001"; // Default for first entry

  if (lastStudent && lastStudent.refId) {
    const lastRefNumber = parseInt(lastStudent.refId.replace("STD", ""), 10) || 0;
    newRefId = `STD${String(lastRefNumber + 1).padStart(5, "0")}`;
  }

  return newRefId;
};


const createStudentIntoDB = async (payload: TStudent) => {
  try {
    payload.refId = await generateRefId();
    const result = await Student.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createStudentIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};


const getAllStudentFromDB = async (query: Record<string, unknown>) => {
  const {
    staffId,
    status,
    institute,
    term,
    academic_year_id,
    applicationCourse,
    year,
    session,
    paymentStatus,
    ...otherQueryParams
  } = query;

  // Preprocess the query parameters
  const processedQuery: Record<string, unknown> = { ...otherQueryParams };

  if (staffId) {
    processedQuery['assignStaff'] = staffId;
  }

  if (status) {
    processedQuery['applications.status'] = { $regex: status, $options: 'i' };
  }

  if (institute) {
    // Match the institute ID in the referenced `courseRelation.institute` field
    processedQuery['applications.courseRelationId'] = {
      $in: await CourseRelation.find({ institute }).distinct('_id'),
    };
  }

  if (term) {
    processedQuery['applications.courseRelationId'] = {
      $in: await CourseRelation.find({ term }).distinct('_id'),
    };
  }

  if (academic_year_id) {
    // Find all `term` documents with the matching academic_year_id
    const termIds = await Term.find({ academic_year_id }).distinct('_id');

    // Find all `courseRelation` documents that reference these term IDs
    const courseRelationIds = await CourseRelation.find({ term: { $in: termIds } }).distinct('_id');

    // Match the `courseRelationId` in the `applications` array to the `courseRelation` IDs
    processedQuery['applications.courseRelationId'] = {
      $in: courseRelationIds,
    };
  }

  if (applicationCourse || year || session || paymentStatus) {
    // Construct the query for the `accounts` array
    const accountsQuery: Record<string, unknown> = {};

    if (applicationCourse) {
      accountsQuery['accounts.courseRelationId._id'] = applicationCourse; // Match courseRelationId in accounts
    }

    if (year) {
      accountsQuery['accounts.years.year'] = year; // Match year in accounts
    }

    if (session) {
      accountsQuery['accounts.years.sessions.sessionName'] = session; // Match session in accounts
    }

    if (paymentStatus) {
      accountsQuery['accounts.years.sessions.status'] = paymentStatus; // Match payment status in accounts
    }

    // Add the accounts query to the processedQuery
    processedQuery['$and'] = (processedQuery['$and'] || []).concat([{ accounts: { $elemMatch: accountsQuery } }]);
  }

  const StudentQuery = new QueryBuilder(
    Student.find().populate({
      path: 'accounts.courseRelationId',
      populate: [
        {
          path: 'institute',
          select: 'name _id',
        },
        {
          path: 'course',
          select: 'name _id',
        },
        {
          path: 'term',
          select: 'term academic_year_id _id',
        },
      ],
    }),
    processedQuery
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await StudentQuery.countTotal();
  const result = await StudentQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleStudentFromDB = async (id: string) => {
  const result = await Student.findById(id)
    .populate("agent")
    .populate("assignStaff", "name email status")
    .populate({
      path: "applications.statusLogs",
      select: "changed_to assigned_by changed_by assigned_at created_at",
      populate: {
        path: "assigned_by",
        select: "name", 
      }
    })
    .populate({
      path: "applications.statusLogs",
      populate: {
        path: "changed_by", 
        select: "name", 
      }
    })
    .populate({
      path: "applications.courseRelationId",
      select: "institute course term", 
      populate: {
        path: "institute", 
        select: "name" 
      }
    })
    .populate({
      path: "applications.courseRelationId",
      populate: {
        path: "course", 
        select: "name" 
      }
    })
    .populate({
      path: "applications.courseRelationId",
      populate: {
        path: "term",
        select: "term" 
      }
    }).populate('accounts.years.sessions').populate({
      path: "accounts.courseRelationId",
      populate: [
        { path: "course", select: "name" },
        { path: "institute", select: "name" },
        { path: "term", select: "term" }
      ]
    });

  return result;
};


const updateStudentIntoDB = async (id: string, payload: Partial<TStudent>) => {
  const student = await Student.findById(id);

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }
  if (payload.agent) {
    const agent = await User.findById(payload.agent);
    if (!agent) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }


    if (agent.email === "m.bhuiyan@lcc.ac.uk") {
      payload.assignStaff = [student.createdBy]; // Copy createdBy ID to assignStaff
    } else {
      payload.assignStaff = agent.nominatedStaffs; // Otherwise, use nominatedStaffs
    }

    // Replace assignStaff with the new agent's nominatedStaffs
    // payload.assignStaff = agent.nominatedStaffs;
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await Student.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const StudentServices = {
  getAllStudentFromDB,
  getSingleStudentFromDB,
  updateStudentIntoDB,
  createStudentIntoDB
  

};
