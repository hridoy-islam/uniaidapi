import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { TermServices } from "./term.service";



const TermCreate = catchAsync(async (req, res) => {
  const result = await TermServices.createTermIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Term created successfully",
    data: result,
  });
});

const getAllTerm: RequestHandler = catchAsync(async (req, res) => {
  const result = await TermServices.getAllTermFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Term retrived succesfully",
    data: result,
  });
});
const getSingleTerm = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TermServices.getSingleTermFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Term is retrieved succesfully",
    data: result,
  });
});

const updateTerm = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TermServices.updateTermIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Term is updated succesfully",
    data: result,
  });
});




export const TermControllers = {
  getAllTerm,
  getSingleTerm,
  updateTerm,
  TermCreate
};
