import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";
import Note from "./note.model";
import { NoteSearchableFields } from "./note.constant";
import { TNote } from "./note.interface";



const createNoteIntoDB = async (payload: TNote) => {
  try {
    
    const result = await Note.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createNoteIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllNoteFromDB = async (query: Record<string, unknown>) => {

  
  const userQuery = new QueryBuilder(Note.find().populate("createdBy","name").populate("followUpBy","name").populate("student","_id email"), query)
    .search(NoteSearchableFields)
    .filter()
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

const getSingleNoteFromDB = async (id: string) => {
  const result = await Note.findById(id).populate("createdBy","name email").populate("followUpBy","name email").populate("comment.user", "name email");
  return result;
};

const updateNoteIntoDB = async (id: string, payload: Partial<TNote>) => {
  const note = await Note.findById(id);

  if (!note) {
    throw new AppError(httpStatus.NOT_FOUND, "Note not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await Note.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const NoteServices = {
  getAllNoteFromDB,
  getSingleNoteFromDB,
  updateNoteIntoDB,
  createNoteIntoDB
  

};
