/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { BankControllers } from "./bank.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  auth("admin", "agent", "staff"),
  BankControllers.getAllBank
);
router.post(
  "/",
  auth("admin", "agent", "staff"),
  BankControllers.BankCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  BankControllers.getSingleBank
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  BankControllers.updateBank
);


export const BankRoutes = router;
