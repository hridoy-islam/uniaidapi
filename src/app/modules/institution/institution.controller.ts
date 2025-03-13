import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { InstitutionServices } from "./institution.service";



const institutionCreate = catchAsync(async (req, res) => {
  const result = await InstitutionServices.createInstitutionIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institution created successfully",
    data: result,
  });
});

const getAllInstitution: RequestHandler = catchAsync(async (req, res) => {
  const result = await InstitutionServices.getAllInstitutionFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institution retrived succesfully",
    data: result,
  });
});
const getSingleInstitution = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await InstitutionServices.getSingleInstitutionFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institution is retrieved succesfully",
    data: result,
  });
});

const updateInstitution = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await InstitutionServices.updateInstitutionIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institution is updated succesfully",
    data: result,
  });
});




export const InstitutionControllers = {
  getAllInstitution,
  getSingleInstitution,
  updateInstitution,
  institutionCreate
};
