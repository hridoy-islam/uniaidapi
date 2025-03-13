/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { AcademicYearsControllers } from "./academicYears.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  auth("admin", "agent", "staff"),
  AcademicYearsControllers.getAllAcademicYears
);
router.post(
  "/",
  auth("admin", "agent", "staff"),
  AcademicYearsControllers.AcademicYearsCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  AcademicYearsControllers.getSingleAcademicYears
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  AcademicYearsControllers.updateAcademicYears
);


export const AcademicYearsRoutes = router;
