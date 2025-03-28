/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { StudentControllers } from "./student.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  // auth("admin", "agent", "staff"),
  StudentControllers.getAllStudent
);
router.post(
  "/",
  auth("admin", "agent", "staff"),
  StudentControllers.StudentCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  StudentControllers.getSingleStudent
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  StudentControllers.updateStudent
);

router.patch(
  "/:id/application/:appId",
  auth("admin", "agent", "staff"),
  StudentControllers.updateStudentApplication
);



export const StudentRoutes = router;
