import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import {AgentCourseSearchableFields } from "./agentCourse.constant";
import { TAgentCourse } from "./agentCourse.interface";
import AgentCourse from "./agentCourse.model";



const createAgentCourseIntoDB = async (payload: TAgentCourse) => {
  try {
    
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

  // Toggle `isDeleted` status for the selected user only
  // "const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await AgentCourse.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const AgentCourseServices = {
  getAllAgentCourseFromDB,
  getSingleAgentCourseFromDB,
  updateAgentCourseIntoDB,
  createAgentCourseIntoDB
  

};
