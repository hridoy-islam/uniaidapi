import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import {TEmailConfig } from "./email-configs.interface";

const emailConfigSchema = new Schema(
  {
    email: { type: String, required: true },
    host: { type: String, required: true },
    port: { type: Number, required: true },
    encryption: { type: String, required: true },
    authentication: { type: Boolean, required: true },
    password: { type: String, required: true },
  }
);

// Apply the type at the model level

const emailConfig = mongoose.model<TEmailConfig & Document>(
  "EmailConfig",
  emailConfigSchema
);
export default emailConfig;
