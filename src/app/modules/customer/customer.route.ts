/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { CustomerControllers } from "./customer.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  auth("admin", "agent", "staff"),
  CustomerControllers.getAllCustomer
);
router.post(
  "/",
  auth("admin", "agent", "staff"),
  CustomerControllers.CustomerCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  CustomerControllers.getSingleCustomer
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  CustomerControllers.updateCustomer
);


export const CustomerRoutes = router;
