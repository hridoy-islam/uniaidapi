import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import { EmailLogsSearchableFields } from "./email-logs.constant";
import { TEmailLog } from "./email-logs.interface";
import EmailLog from "./email-logs.model";



const createEmailLogIntoDB = async (payload: TEmailLog) => {
  try {
    
    const result = await EmailLog.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createEmailLogIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllEmailLogFromDB = async (query: Record<string, unknown>) => {
  const EmailLogQuery = new QueryBuilder(EmailLog.find().populate("studentId","name email").populate("emailConfigId"), query)
    .search(EmailLogsSearchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await EmailLogQuery.countTotal();
  const result = await EmailLogQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleEmailLogFromDB = async (id: string) => {
  const result = await EmailLog.findById(id);
  return result;
};

const updateEmailLogIntoDB = async (id: string, payload: Partial<TEmailLog>) => {
  const emailLog = await EmailLog.findById(id);

  if (!emailLog) {
    throw new AppError(httpStatus.NOT_FOUND, "EmailLog not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await EmailLog.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const EmailLogServices = {
  getAllEmailLogFromDB,
  getSingleEmailLogFromDB,
  updateEmailLogIntoDB,
  createEmailLogIntoDB
  

};
