import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { EmailLogServices } from "./email-logs.service";



const EmailLogCreate = catchAsync(async (req, res) => {
  const result = await EmailLogServices.createEmailLogIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailLog created successfully",
    data: result,
  });
});

const getAllEmailLog: RequestHandler = catchAsync(async (req, res) => {
  const result = await EmailLogServices.getAllEmailLogFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailLog retrived succesfully",
    data: result,
  });
});
const getSingleEmailLog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EmailLogServices.getSingleEmailLogFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailLog is retrieved succesfully",
    data: result,
  });
});

const updateEmailLog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EmailLogServices.updateEmailLogIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailLog is updated succesfully",
    data: result,
  });
});




export const EmailLogControllers = {
  getAllEmailLog,
  getSingleEmailLog,
  updateEmailLog,
  EmailLogCreate
};
