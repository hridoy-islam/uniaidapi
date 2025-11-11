import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";
import Institution from "./institution.model";
import { institutionSearchableFields } from "./institution.constant";
import { TInstitution } from "./institution.interface";



const createInstitutionIntoDB = async (payload: TInstitution) => {
  try {
    
    const result = await Institution.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createInstitutionIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllInstitutionFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(Institution.find(), query)
    .search(institutionSearchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleInstitutionFromDB = async (id: string) => {
  const result = await Institution.findById(id);
  return result;
};

const updateInstitutionIntoDB = async (id: string, payload: Partial<TInstitution>) => {
  const institution = await Institution.findById(id);

  if (!institution) {
    throw new AppError(httpStatus.NOT_FOUND, "Institution not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await Institution.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const InstitutionServices = {
  getAllInstitutionFromDB,
  getSingleInstitutionFromDB,
  updateInstitutionIntoDB,
  createInstitutionIntoDB
  

};
