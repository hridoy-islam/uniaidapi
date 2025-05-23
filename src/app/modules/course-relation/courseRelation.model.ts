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

const courseRelationSchema = new Schema<TCourseRelation>(
  {
    institute: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    term: { type: Schema.Types.ObjectId, ref: "Term", required: true },
    local: { type: Boolean },
    local_amount: { type: String},
    international: { type: Boolean },
    international_amount: { type: String },
    years: [yearSchema], // Array of years with sessions
    status: { type: Number, enum: [0, 1], default: 1 },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

courseRelationSchema.virtual("institute_name").get(function () {
  return this.institute?.name;
});

courseRelationSchema.virtual("course_name").get(function () {
  return this.course?.name;
});

courseRelationSchema.virtual("term_name").get(function () {
  return this.term?.term;
});

const CourseRelation = mongoose.model<TCourseRelation>("CourseRelation", courseRelationSchema);




export default CourseRelation;



