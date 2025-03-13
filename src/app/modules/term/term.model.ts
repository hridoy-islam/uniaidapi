import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import { TTerm} from "./term.interface";

const TermSchema = new Schema(
  {

    term:{
      type: String,
      
    },
    academic_year_id: { 
      type: Types.ObjectId,
      ref: "AcademicYears",
   },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  
);

// Apply the type at the model level
const Term = mongoose.model<TTerm & Document>(
  "Term",
  TermSchema
);
export default Term;
