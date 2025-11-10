import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import { courseSearchableFields } from "./course.constant";
import { TCourse } from "./course.interface";
import Course from "./course.model";



const createCourseIntoDB = async (payload: TCourse) => {
  try {
    
    const result = await Course.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createCourseIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllCourseFromDB = async (query: Record<string, unknown>) => {
  const courseQuery = new QueryBuilder(Course.find(), query)
    .search(courseSearchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await courseQuery.countTotal();
  const result = await courseQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleCourseFromDB = async (id: string) => {
  const result = await Course.findById(id);
  return result;
};

const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
  const course = await Course.findById(id);

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "course not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await Course.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const CourseServices = {
  getAllCourseFromDB,
  getSingleCourseFromDB,
  updateCourseIntoDB,
  createCourseIntoDB
  

};
