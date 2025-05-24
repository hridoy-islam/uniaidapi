import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import {AgentCourseSearchableFields } from "./agentCourse.constant";
import { TAgentCourse } from "./agentCourse.interface";
import AgentCourse from "./agentCourse.model";
import Student from "../student/student.model";
import CourseRelation from "../course-relation/courseRelation.model";



const createAgentCourseIntoDB = async (payload: TAgentCourse) => {
  try {
    const existingCourse = await AgentCourse.findOne({
      agentId: payload.agentId,
      courseRelationId: payload.courseRelationId, 
    });

   const courseRelation = await CourseRelation.findById(payload.courseRelationId);

    if (!courseRelation) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid courseRelationId");
    }

    // Step 3: Ensure "Year 1" is present in CourseRelation.years
    const hasYear1 = courseRelation.years?.some((year: any) => year.year === "Year 1");

    if (!hasYear1) {
      throw new AppError(httpStatus.BAD_REQUEST, `This course does not have Year 1 information. Please add Year 1 details before assigning.`);
    }



    if (existingCourse) {
      throw new AppError(httpStatus.BAD_REQUEST, "This Course already exists");
    }

    const result = await AgentCourse.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createAgentCourseIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllAgentCourseFromDB = async (query: Record<string, unknown>) => {
  const AgentCourseQuery = new QueryBuilder(AgentCourse.find().populate({
    path: 'courseRelationId',
    populate: [
      { path: 'institute', select: 'name' },  // Populate the 'institute' field and select 'name'
      { path: 'course', select: 'name' },     // Populate the 'course' field and select 'name'
      { path: 'term', select: 'term' },       // Populate the 'term' field and select 'term'
    ]
  })
    , query)
    .search(AgentCourseSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();


  const meta = await AgentCourseQuery.countTotal();
  const result = await AgentCourseQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleAgentCourseFromDB = async (id: string) => {
  const result = await AgentCourse.findById(id)
    .populate("courseRelationId");

  return result;
};



const updateAgentCourseIntoDB = async (id: string, payload: Partial<TAgentCourse>) => {
  const agentCourse = await AgentCourse.findById(id);

  if (!agentCourse) {
    throw new AppError(httpStatus.NOT_FOUND, "AgentCourse not found");
  }

  const result = await AgentCourse.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) return null;

  // Fetch matching students
  const students = await Student.find({
    agent: result.agentId,
    "agentPayments.courseRelationId": result.courseRelationId,
  });

  for (const student of students) {
    let isModified = false;

    for (const payment of student.agentPayments) {
      if (payment.courseRelationId.toString() !== result.courseRelationId.toString()) continue;

      for (const year of payment.years) {
        for (const session of year.sessions) {
          const updatedSession = result.year?.find(
            (s) => s.sessionName === session.sessionName
          );

          if (updatedSession && session.invoiceDate.toISOString() !== updatedSession.invoiceDate.toISOString()) {
            session.invoiceDate = updatedSession.invoiceDate;
            isModified = true;
          }
        }
      }
    }

    if (isModified) {
      await student.save();
    }
  }

  return result;
};





export const AgentCourseServices = {
  getAllAgentCourseFromDB,
  getSingleAgentCourseFromDB,
  updateAgentCourseIntoDB,
  createAgentCourseIntoDB
  

};
