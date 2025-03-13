import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import {termSearchableFields } from "./term.constant";
import { TTerm } from "./term.interface";
import Term from "./term.model";



const createTermIntoDB = async (payload: TTerm) => {
  try {
    
    const result = await Term.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createTermIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllTermFromDB = async (query: Record<string, unknown>) => {
  const TermQuery = new QueryBuilder(Term.find().populate("academic_year_id"), query)
    .search(termSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await TermQuery.countTotal();
  const result = await TermQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleTermFromDB = async (id: string) => {
  const result = await Term.findById(id);
  return result;
};

const updateTermIntoDB = async (id: string, payload: Partial<TTerm>) => {
  const term = await Term.findById(id);

  if (!term) {
    throw new AppError(httpStatus.NOT_FOUND, "Term not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await Term.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const TermServices = {
  getAllTermFromDB,
  getSingleTermFromDB,
  updateTermIntoDB,
  createTermIntoDB
  

};
