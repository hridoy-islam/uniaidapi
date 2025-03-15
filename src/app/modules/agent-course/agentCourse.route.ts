/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { AgentCourseControllers } from "./agentCourse.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  // auth("admin", "agent", "staff"),
  AgentCourseControllers.getAllAgentCourse
);
router.post(
  "/",
  auth("admin", "agent", "staff"),
  AgentCourseControllers.AgentCourseCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  AgentCourseControllers.getSingleAgentCourse
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  AgentCourseControllers.updateAgentCourse
);


export const AgentCourseRoutes = router;
