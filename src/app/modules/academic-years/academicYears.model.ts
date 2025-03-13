import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import { TAcademicYears} from "./academicYears.interface";

const AcademicYearsSchema = new Schema(
  {
    academic_year: { type: String, required: true },

    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
 
);

// Apply the type at the model level
const AcademicYears = mongoose.model<TAcademicYears & Document>(
  "AcademicYears",
  AcademicYearsSchema
);
export default AcademicYears;
