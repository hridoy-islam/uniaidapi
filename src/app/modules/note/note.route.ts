/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/multer";
import { NoteControllers } from "./note.controller";
// import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  "/",
  // auth("admin", "agent", "staff"),
  NoteControllers.getAllNote
);
router.post(
  "/",
  // auth("admin", "agent", "staff"),
  NoteControllers.NoteCreate
);
router.get(
  "/:id",
  auth("admin", "agent", "staff"),
  NoteControllers.getSingleNote
);

router.patch(
  "/:id",
  auth("admin", "agent", "staff"),
  NoteControllers.updateNote
);


export const NoteRoutes = router;
