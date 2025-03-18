import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { InvoiceServices } from "./invoice.service";



const InvoiceCreate = catchAsync(async (req, res) => {
  const result = await InvoiceServices.createInvoiceIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice created successfully",
    data: result,
  });
});

const getAllInvoice: RequestHandler = catchAsync(async (req, res) => {
  const result = await InvoiceServices.getAllInvoiceFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice retrived succesfully",
    data: result,
  });
});
const getSingleInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await InvoiceServices.getSingleInvoiceFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice is retrieved succesfully",
    data: result,
  });
});

const updateInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await InvoiceServices.updateInvoiceIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Invoice is updated succesfully",
    data: result,
  });
});




export const InvoiceControllers = {
  getAllInvoice,
  getSingleInvoice,
  updateInvoice,
  InvoiceCreate
};
