import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import {TEmailLog } from "./email-logs.interface";

const emailLogSchema = new Schema(
  {
    emailConfigId: { type: Types.ObjectId, required: true, ref: "EmailConfig" }, 
    emailDraft: { type: Types.ObjectId, ref: "EmailDraft" }, 
    studentId: { type: Types.ObjectId, required: true, ref: "Student" }, 
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ["pending", "sent"], default: "pending" }, 
  },
  {
    timestamps: true, 
  }
);



const EmailLog = mongoose.model<TEmailLog & Document>(
  "EmailLog",
  emailLogSchema
);
export default EmailLog;
