/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { EmailControllers } from "./email.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  "/",
  // auth("admin", "agent", "staff"),
  EmailControllers.EmailSend
);


export const EmailRoutes = router;
