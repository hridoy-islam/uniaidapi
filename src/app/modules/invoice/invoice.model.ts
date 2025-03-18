import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import { TInvoice } from "./invoice.interface";

const InvoiceSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    semester: { type: String, required: true },
    noOfStudents: { type: Number, required: true },
    Logo: { type: String, required: true },
    remitTo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
    },
    paymentInfo: {
      sortCode: { type: String, required: true },
      accountNo: { type: String, required: true },
      beneficiary: { type: String, required: true },
    },
    students: [
      {
        collageroll: { type: Number, required: true },
        refId: { type: String, required: true },
        name: { type: String, required: true },
        course: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    Status: { type: String, enum: ["due", "paid"], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseRelationId: { type: Schema.Types.ObjectId, ref: "CourseRelation", required: true },
    Year: { type: String, required: true },
    Session: { type: String, required: true },
  },
  {
    timestamps: true, 
  }
);


const Invoice = mongoose.model<TInvoice & Document>(
  "Invoice",
  InvoiceSchema
);
export default Invoice;
