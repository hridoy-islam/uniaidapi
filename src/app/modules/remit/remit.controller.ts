import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import {  RemitInvoiceServices} from "./remit.service";



const RemitInvoiceCreate = catchAsync(async (req, res) => {
  const result = await RemitInvoiceServices.createRemitInvoiceIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice created successfully",
    data: result,
  });
});

const getAllRemitInvoice: RequestHandler = catchAsync(async (req, res) => {
  const result = await RemitInvoiceServices.getAllRemitInvoiceFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice retrived succesfully",
    data: result,
  });
});
const getSingleRemitInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RemitInvoiceServices.getSingleRemitInvoiceFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice is retrieved succesfully",
    data: result,
  });
});

const updateRemitInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RemitInvoiceServices.updateRemitInvoiceIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice is updated succesfully",
    data: result,
  });
});




export const RemitInvoiceControllers = {
  getAllRemitInvoice,
  getSingleRemitInvoice,
  updateRemitInvoice,
  RemitInvoiceCreate
};
