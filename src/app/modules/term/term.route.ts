/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { TermControllers } from "./term.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  // auth("admin", "agent", "staff"),
  TermControllers.getAllTerm
);
router.post(
  "/",
  auth("admin", "agent", "staff"),
  TermControllers.TermCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  TermControllers.getSingleTerm
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  TermControllers.updateTerm
);


export const TermRoutes = router;
