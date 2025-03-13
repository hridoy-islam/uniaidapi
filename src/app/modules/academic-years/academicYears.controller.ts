import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AcademicYearsServices } from "./academicYears.service";



const AcademicYearsCreate = catchAsync(async (req, res) => {
  const result = await AcademicYearsServices.createAcademicYearsIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AcademicYears created successfully",
    data: result,
  });
});

const getAllAcademicYears: RequestHandler = catchAsync(async (req, res) => {
  const result = await AcademicYearsServices.getAllAcademicYearsFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AcademicYears retrived succesfully",
    data: result,
  });
});
const getSingleAcademicYears = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AcademicYearsServices.getSingleAcademicYearsFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AcademicYears is retrieved succesfully",
    data: result,
  });
});

const updateAcademicYears = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AcademicYearsServices.updateAcademicYearsIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AcademicYears is updated succesfully",
    data: result,
  });
});




export const AcademicYearsControllers = {
  getAllAcademicYears,
  getSingleAcademicYears,
  updateAcademicYears,
  AcademicYearsCreate
};
