import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { EmailServices } from "./email.service";



const EmailSend = catchAsync(async (req, res) => {
  const result = await EmailServices.sendEmail(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email send successfully",
    data: result,
  });
});




export const EmailControllers = {
  EmailSend
};
