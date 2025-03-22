import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { RemitServices } from "./remit.service";



const RemitCreate = catchAsync(async (req, res) => {
  const result = await RemitServices.createRemitIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Remit created successfully",
    data: result,
  });
});

const getAllRemit: RequestHandler = catchAsync(async (req, res) => {
  const result = await RemitServices.getAllRemitFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Remit retrived succesfully",
    data: result,
  });
});
const getSingleRemit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RemitServices.getSingleRemitFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Remit is retrieved succesfully",
    data: result,
  });
});

const updateRemit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RemitServices.updateRemitIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Remit is updated succesfully",
    data: result,
  });
});




export const RemitControllers = {
  getAllRemit,
  getSingleRemit,
  updateRemit,
  RemitCreate
};
