/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { InvoiceControllers } from "./invoice.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  // auth("admin", "agent", "staff"),
  InvoiceControllers.getAllInvoice
);
router.post(
  "/",
  // auth("admin", "agent", "staff"),
  InvoiceControllers.InvoiceCreate
);
router.get(
  "/:id",
  // auth("admin", "agent", "staff"),
  InvoiceControllers.getSingleInvoice
);

router.patch(
  "/:id",
  // auth("admin", "agent", "staff"),
  InvoiceControllers.updateInvoice
);


export const InvoiceRoutes = router;
