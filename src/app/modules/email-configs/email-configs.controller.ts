import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { EmailConfigServices } from "./email-configs.service";



const EmailConfigCreate = catchAsync(async (req, res) => {
  const result = await EmailConfigServices.createEmailConfigIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailConfig created successfully",
    data: result,
  });
});

const getAllEmailConfig: RequestHandler = catchAsync(async (req, res) => {
  const result = await EmailConfigServices.getAllEmailConfigFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailConfig retrived succesfully",
    data: result,
  });
});
const getSingleEmailConfig = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EmailConfigServices.getSingleEmailConfigFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailConfig is retrieved succesfully",
    data: result,
  });
});

const updateEmailConfig = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EmailConfigServices.updateEmailConfigIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailConfig is updated succesfully",
    data: result,
  });
});




export const EmailConfigControllers = {
  getAllEmailConfig,
  getSingleEmailConfig,
  updateEmailConfig,
  EmailConfigCreate
};
