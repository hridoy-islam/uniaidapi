/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { EmailConfigControllers } from "./email-configs.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  auth("admin", "agent", "staff"),
  EmailConfigControllers.getAllEmailConfig
);
router.post(
  "/",
  auth("admin", "agent", "staff"),
  EmailConfigControllers.EmailConfigCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  EmailConfigControllers.getSingleEmailConfig
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  EmailConfigControllers.updateEmailConfig
);


export const EmailConfigRoutes = router;
