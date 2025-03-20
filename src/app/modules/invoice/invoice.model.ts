import mongoose, { Schema, Document, Types } from "mongoose";
import { TInvoice } from "./invoice.interface";
import CourseRelation from "../course-relation/courseRelation.model";

const invoiceSchema = new Schema(
  {
    reference: { type: String,},
    date: { type: Date},
    noOfStudents: { type: Number },
    logo: { type: String},
    remitTo: {
      name: { type: String},
      email: { type: String },
      address: { type: String },
    },
    paymentInfo: {
      sortCode: { type: String, required: true },
      accountNo: { type: String, required: true },
      beneficiary: { type: String },
    },

    students: [{ type: Types.ObjectId, ref: "Student" }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["due", "paid"], required: true, default: "due" },
    createdBy: { type: Types.ObjectId, required: true },
    courseRelationId: { type: Types.ObjectId, ref: "CourseRelation", required: true },
    year: { type: String },
    session: { type: String },
    semester: { type: String },
    course:{type: String},
    exported:{type: Boolean, default: false}
  },
  {
    timestamps: true, 
  }
);



const Invoice = mongoose.model<TInvoice & Document>("Invoice", invoiceSchema);

export default Invoice;
