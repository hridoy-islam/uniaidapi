/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { RemitControllers } from "./remit.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  auth("admin", "agent", "staff"),
  RemitControllers.getAllRemit
);
router.post(
  "/",
  auth("admin", "agent", "staff"),
  RemitControllers.RemitCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  RemitControllers.getSingleRemit
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  RemitControllers.updateRemit
);


export const RemitRoutes = router;
