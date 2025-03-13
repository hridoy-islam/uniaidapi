import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import {TEmailDraft } from "./email-drafts.interface";

const emailConfigSchema = new Schema(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },

  }
);



const emailDraft = mongoose.model<TEmailDraft & Document>(
  "EmailDraft",
  emailConfigSchema
);
export default emailDraft;
