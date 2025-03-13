/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { InstitutionControllers } from "./institution.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  // auth("admin", "agent", "staff"),
  InstitutionControllers.getAllInstitution
);
router.post(
  "/",
  // auth("admin", "agent", "staff"),
  InstitutionControllers.institutionCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  InstitutionControllers.getSingleInstitution
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  InstitutionControllers.updateInstitution
);


export const InstitutionRoutes = router;
