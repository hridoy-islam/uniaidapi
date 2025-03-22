import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import { remitSearchableFields } from "./remit.constant";
import { TRemit } from "./remit.interface";
import Remit from "./remit.model";



const createRemitIntoDB = async (payload: TRemit) => {
  try {
    
    const result = await Remit.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createRemitIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Remit");
  }
};

const getAllRemitFromDB = async (query: Record<string, unknown>) => {
  const RemitQuery = new QueryBuilder(Remit.find(), query)
    .search(remitSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await RemitQuery.countTotal();
  const result = await RemitQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleRemitFromDB = async (id: string) => {
  const result = await Remit.findById(id);
  return result;
};

const updateRemitIntoDB = async (id: string, payload: Partial<TRemit>) => {
  const remit = await Remit.findById(id);

  if (!remit) {
    throw new AppError(httpStatus.NOT_FOUND, "Remit not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await Remit.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const RemitServices = {
  getAllRemitFromDB,
  getSingleRemitFromDB,
  updateRemitIntoDB,
  createRemitIntoDB
  

};
