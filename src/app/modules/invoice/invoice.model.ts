import mongoose, { Schema, Document, Types } from "mongoose";
import { TInvoice } from "./invoice.interface";
import CourseRelation from "../course-relation/courseRelation.model";

const invoiceSchema = new Schema(
  {
    reference: { type: String,},
    date: { type: Date},
    noOfStudents: { type: Number },
    Logo: { type: String},
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
    // students: [
    //   {
        
    //     collageroll: { type: Number, required: true },
    //     refId: { type: String, required: true },
    //     name: { type: String, required: true },
    //     course: { type: String, required: true },
    //     amount: { type: Number, required: true },
    //   },
    // ],

    students: [{ type: Types.ObjectId, ref: "Student" }],
    totalAmount: { type: Number, required: true },
    Status: { type: String, enum: ["due", "paid"], required: true, default: "due" },
    createdBy: { type: Types.ObjectId, required: true },
    courseRelationId: { type: Types.ObjectId, ref: "CourseRelation", required: true },
    Year: { type: String },
    Session: { type: String },
    semester: { type: String },
    course:{type: String},
    Exported:{type: Boolean, default: false}
  },
  {
    timestamps: true, 
  }
);



const Invoice = mongoose.model<TInvoice & Document>("Invoice", invoiceSchema);

export default Invoice;
