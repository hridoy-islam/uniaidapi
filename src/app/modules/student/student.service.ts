import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import {studentSearchableFields } from "./student.constant";
import { TStudent } from "./student.interface";
import Student from "./student.model";


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
  const StudentQuery = new QueryBuilder(Student.find(), query)
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
  const result = await Student.findById(id) .populate("agent") 
  .populate("assignStaff", "name email status"); 
  return result;
};

const updateStudentIntoDB = async (id: string, payload: Partial<TStudent>) => {
  const student = await Student.findById(id);

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
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
