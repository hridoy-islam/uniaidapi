/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { CourseControllers } from "./course.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  auth("admin", "agent", "staff"),
  CourseControllers.getAllCourse
);
router.post(
  "/",
  auth("admin", "agent", "staff"),
  CourseControllers.courseCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  CourseControllers.getSingleCourse
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  CourseControllers.updateCourse
);


export const CourseRoutes = router;
