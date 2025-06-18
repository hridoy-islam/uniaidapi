import mongoose, { Mongoose, Schema } from "mongoose";
import { TCSV } from "./csv.interface";

const studentDataSchema = new Schema({
  name: { type: String, required: true },
  regNo: { type: String, required: true },
  phone: { type: String, required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "Student"  },
});

const csvSchema = new Schema({
  studentData: [studentDataSchema],
});

// Create the Invoice model
const CSV = mongoose.model<TCSV>("CSV", csvSchema);

export default CSV;
