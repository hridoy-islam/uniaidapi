import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { EmailDraftServices } from "./email-drafts.service";



const EmailDraftCreate = catchAsync(async (req, res) => {
  const result = await EmailDraftServices.createEmailDraftIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailDraft created successfully",
    data: result,
  });
});

const getAllEmailDraft: RequestHandler = catchAsync(async (req, res) => {
  const result = await EmailDraftServices.getAllEmailDraftFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailDraft retrived succesfully",
    data: result,
  });
});
const getSingleEmailDraft = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EmailDraftServices.getSingleEmailDraftFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailDraft is retrieved succesfully",
    data: result,
  });
});

const updateEmailDraft = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EmailDraftServices.updateEmailDraftIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "EmailDraft is updated succesfully",
    data: result,
  });
});




export const EmailDraftControllers = {
  getAllEmailDraft,
  getSingleEmailDraft,
  updateEmailDraft,
  EmailDraftCreate
};
