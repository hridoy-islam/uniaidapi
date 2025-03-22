import mongoose, { Schema, Document, Types } from "mongoose";
import { TInvoice } from "./invoice.interface";
import CourseRelation from "../course-relation/courseRelation.model";

const invoiceSchema = new Schema(
  {
    reference: { type: String, },
    date: { type: Date },
    noOfStudents: { type: Number },
    remit: { type: Schema.Types.ObjectId, ref:"Remit" },

    students: [
      {
        collageroll: { type: String, required: true },
        refId: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        course: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],

    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["due", "paid"], required: true, default: "due" },
    createdBy: { type: Types.ObjectId, required: true },
    courseRelationId: { type: Types.ObjectId, ref: "CourseRelation", required: true },
    year: { type: String },
    session: { type: String },
    semester: { type: String },
    course: { type: String },
    exported: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);



const Invoice = mongoose.model<TInvoice & Document>("Invoice", invoiceSchema);

export default Invoice;
