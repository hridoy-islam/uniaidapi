import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import {courseRelationSearchableFields } from "./courseRelation.constant";
import { TCourseRelation } from "./courseRelation.interface";
import CourseRelation from "./courseRelation.model";



const createCourseRelationIntoDB = async (payload: TCourseRelation) => {
  try {
    
    const result = await CourseRelation.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createCourseRelationIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllCourseRelationFromDB = async (query: Record<string, unknown>) => {
  const CourseRelationQuery = new QueryBuilder(CourseRelation.find().populate('institute') 
  .populate('course') 
  .populate('term'), query)
    .search(courseRelationSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await CourseRelationQuery.countTotal();
  const result = await CourseRelationQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleCourseRelationFromDB = async (id: string) => {
  const result = await CourseRelation.findById(id).populate('institute') 
  .populate('course') 
  .populate('term');
  return result;
};

const updateCourseRelationIntoDB = async (id: string, payload: Partial<TCourseRelation>) => {
  const courseRelation = await CourseRelation.findById(id);

  if (!courseRelation) {
    throw new AppError(httpStatus.NOT_FOUND, "CourseRelation not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await CourseRelation.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const CourseRelationServices = {
  getAllCourseRelationFromDB,
  getSingleCourseRelationFromDB,
  updateCourseRelationIntoDB,
  createCourseRelationIntoDB
  

};
