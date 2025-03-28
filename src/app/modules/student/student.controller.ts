import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { StudentServices } from "./student.service";



const StudentCreate = catchAsync(async (req, res) => {
  const result = await StudentServices.createStudentIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student created successfully",
    data: result,
  });
});

const getAllStudent: RequestHandler = catchAsync(async (req, res) => {
  const result = await StudentServices.getAllStudentFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student retrived succesfully",
    data: result,
  });
});
const getSingleStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StudentServices.getSingleStudentFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student is retrieved succesfully",
    data: result,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StudentServices.updateStudentIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student is updated succesfully",
    data: result,
  });
});


const updateStudentApplication = catchAsync(async (req, res) => {
  const { id, appId } = req.params;
  const { newStatus, changedBy } = req.body;

 

  const result = await StudentServices.updateStudentApplicationIntoDB(
    id,
    appId,
    { newStatus, changedBy }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student application updated successfully",
    data: result,
  });
});



export const StudentControllers = {
  getAllStudent,
  getSingleStudent,
  updateStudent,
  StudentCreate,
  updateStudentApplication
};
