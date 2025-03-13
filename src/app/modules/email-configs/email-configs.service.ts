import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import { emailConfigSearchableFields } from "./email-configs.constant";
import { TEmailConfig } from "./email-configs.interface";
import EmailConfig from "./email-configs.model";



const createEmailConfigIntoDB = async (payload: TEmailConfig) => {
  try {
    
    const result = await EmailConfig.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createEmailConfigIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllEmailConfigFromDB = async (query: Record<string, unknown>) => {
  const EmailConfigQuery = new QueryBuilder(EmailConfig.find(), query)
    .search(emailConfigSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await EmailConfigQuery.countTotal();
  const result = await EmailConfigQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleEmailConfigFromDB = async (id: string) => {
  const result = await EmailConfig.findById(id);
  return result;
};

const updateEmailConfigIntoDB = async (id: string, payload: Partial<TEmailConfig>) => {
  const emailConfig = await EmailConfig.findById(id);

  if (!emailConfig) {
    throw new AppError(httpStatus.NOT_FOUND, "EmailConfig not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await EmailConfig.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const EmailConfigServices = {
  getAllEmailConfigFromDB,
  getSingleEmailConfigFromDB,
  updateEmailConfigIntoDB,
  createEmailConfigIntoDB
  

};
