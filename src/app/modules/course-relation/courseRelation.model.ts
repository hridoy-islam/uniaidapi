import mongoose, { Schema, Document, Types } from "mongoose";
import { TCourseRelation } from "./courseRelation.interface";

// Define the session schema
const sessionSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true }, // Ensure MongoDB assigns an ObjectId
  sessionName: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  type: { type: String, enum: ['flat', 'percentage'], required: true },
  rate: { type: Number, required: true },
});

// Define the year schema
const yearSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true }, // Ensure MongoDB assigns an ObjectId
  year: { type: String, required: true },
  sessions: [sessionSchema], // Array of sessions
});

// Define the course relation schema
const courseRelationSchema = new Schema<TCourseRelation>(
  {
    institute: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    term: { type: Schema.Types.ObjectId, ref: "Term", required: true },
    local: { type: Boolean, required: true },
    local_amount: { type: String, required: true },
    international: { type: Boolean, required: true },
    international_amount: { type: String, required: true },
    years: [yearSchema], // Array of years with sessions
    status: { type: Number, enum: [0, 1], default: 1 },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Apply the type at the model level
const CourseRelation = mongoose.model<TCourseRelation>("CourseRelation", courseRelationSchema);

export default CourseRelation;
