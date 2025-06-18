import mongoose, { Schema } from "mongoose";
import { TCSV } from "./csv.interface";

const stuentDataSchema = new Schema(
  {
    name: { type: String, required: true },
    regNo: { type: String, required: true },
    phone: { type: String, required: true },
   
  }
);

const csvSchema = new Schema(
  {
   
    studentData: [stuentDataSchema],
  }
);

// Create the Invoice model
const CSV = mongoose.model<TCSV>("CSV", csvSchema);

export default CSV;
