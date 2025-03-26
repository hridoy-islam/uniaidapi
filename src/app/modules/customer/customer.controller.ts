import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { CustomerServices } from "./customer.service";



const CustomerCreate = catchAsync(async (req, res) => {
  const result = await CustomerServices.createCustomerIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer created successfully",
    data: result,
  });
});

const getAllCustomer: RequestHandler = catchAsync(async (req, res) => {
  const result = await CustomerServices.getAllCustomerFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer retrived succesfully",
    data: result,
  });
});
const getSingleCustomer = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CustomerServices.getSingleCustomerFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer is retrieved succesfully",
    data: result,
  });
});

const updateCustomer = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CustomerServices.updateCustomerIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer is updated succesfully",
    data: result,
  });
});




export const CustomerControllers = {
  getAllCustomer,
  getSingleCustomer,
  updateCustomer,
  CustomerCreate
};
