/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { RemitInvoiceControllers } from "./remit.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  // auth("admin", "agent", "staff"),
  RemitInvoiceControllers.getAllRemitInvoice
);
router.post(
  "/",
  // auth("admin", "agent", "staff"),
  RemitInvoiceControllers.RemitInvoiceCreate
);
router.get(
  "/:id",
  // auth("admin", "agent", "staff"),
  RemitInvoiceControllers.getSingleRemitInvoice
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  RemitInvoiceControllers.updateRemitInvoice
);


export const RemitInvoiceRoutes = router;
