import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { NoteServices } from "./note.service";



const NoteCreate = catchAsync(async (req, res) => {
  const result = await NoteServices.createNoteIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note created successfully",
    data: result,
  });
});

const getAllNote: RequestHandler = catchAsync(async (req, res) => {
  const result = await NoteServices.getAllNoteFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note retrived succesfully",
    data: result,
  });
});
const getSingleNote = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NoteServices.getSingleNoteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note is retrieved succesfully",
    data: result,
  });
});

const updateNote = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NoteServices.updateNoteIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Note is updated succesfully",
    data: result,
  });
});




export const NoteControllers = {
  getAllNote,
  getSingleNote,
  updateNote,
  NoteCreate
};
