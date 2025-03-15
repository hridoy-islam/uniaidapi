import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { CourseRelationServices } from "./courseRelation.service";



const CourseRelationCreate = catchAsync(async (req, res) => {
  const result = await CourseRelationServices.createCourseRelationIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "CourseRelation created successfully",
    data: result,
  });
});

const getAllCourseRelation: RequestHandler = catchAsync(async (req, res) => {
  const result = await CourseRelationServices.getAllCourseRelationFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "CourseRelation retrived succesfully",
    data: result,
  });
});
const getSingleCourseRelation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CourseRelationServices.getSingleCourseRelationFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "CourseRelation is retrieved succesfully",
    data: result,
  });
});

const updateCourseRelation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CourseRelationServices.updateCourseRelationIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "CourseRelation is updated succesfully",
    data: result,
  });
});




export const CourseRelationControllers = {
  getAllCourseRelation,
  getSingleCourseRelation,
  updateCourseRelation,
  CourseRelationCreate
};
