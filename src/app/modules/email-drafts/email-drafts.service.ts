import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import { emailDraftSearchableFields } from "./email-drafts.constant";
import { TEmailDraft } from "./email-drafts.interface";
import EmailDraft from "./email-drafts.model";



const createEmailDraftIntoDB = async (payload: TEmailDraft) => {
  try {
    
    const result = await EmailDraft.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createEmailDraftIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllEmailDraftFromDB = async (query: Record<string, unknown>) => {
  const EmailDraftQuery = new QueryBuilder(EmailDraft.find(), query)
    .search(emailDraftSearchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await EmailDraftQuery.countTotal();
  const result = await EmailDraftQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleEmailDraftFromDB = async (id: string) => {
  const result = await EmailDraft.findById(id);
  return result;
};

const updateEmailDraftIntoDB = async (id: string, payload: Partial<TEmailDraft>) => {
  const emailDraft = await EmailDraft.findById(id);

  if (!emailDraft) {
    throw new AppError(httpStatus.NOT_FOUND, "EmailDraft not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await EmailDraft.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const EmailDraftServices = {
  getAllEmailDraftFromDB,
  getSingleEmailDraftFromDB,
  updateEmailDraftIntoDB,
  createEmailDraftIntoDB
  

};
