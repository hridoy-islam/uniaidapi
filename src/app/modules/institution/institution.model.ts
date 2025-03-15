import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import { TInstitution } from "./institution.interface";

const institutionSchema = new Schema(
  {
    name: { type: String, required: true },

    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  
);

// Apply the type at the model level
const Institution = mongoose.model<TInstitution & Document>(
  "Institution",
  institutionSchema
);
export default Institution;
