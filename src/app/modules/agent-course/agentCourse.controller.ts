import { RequestHandler } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AgentCourseServices } from "./agentCourse.service";



const AgentCourseCreate = catchAsync(async (req, res) => {
  const result = await AgentCourseServices.createAgentCourseIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AgentCourse created successfully",
    data: result,
  });
});

const getAllAgentCourse: RequestHandler = catchAsync(async (req, res) => {
  const result = await AgentCourseServices.getAllAgentCourseFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AgentCourse retrived succesfully",
    data: result,
  });
});
const getSingleAgentCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AgentCourseServices.getSingleAgentCourseFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AgentCourse is retrieved succesfully",
    data: result,
  });
});

const updateAgentCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AgentCourseServices.updateAgentCourseIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AgentCourse is updated succesfully",
    data: result,
  });
});




export const AgentCourseControllers = {
  getAllAgentCourse,
  getSingleAgentCourse,
  updateAgentCourse,
  AgentCourseCreate
};
