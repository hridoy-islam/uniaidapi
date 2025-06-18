import express from "express";
import { CSVControllers } from "./csv.controller";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("admin", "agent", "staff"),
  CSVControllers.createCSV
);

router.delete(
  "/:id",
  auth("admin", "agent", "staff"),
  CSVControllers.deleteCSV
);

router.patch(
  "/:id",
   auth("admin", "agent", "staff"),
  CSVControllers.updateCSV
);

router.get(
  "/",
   auth("admin", "agent", "staff"),
  CSVControllers.getAllCSVs
);


router.get(
  "/:id",
   auth("admin", "agent", "staff"),
  CSVControllers.getOneCSV
);

export const CSVRouter = router;
