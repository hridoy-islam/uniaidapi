import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import {TEmail } from "./email.interface";

const emailSchema = new Schema(
  {
    email: { type: String, required: true },
    host: { type: String, required: true },
    port: { type: Number, required: true },
    encryption: { type: String, required: true },
    authentication: { type: Boolean, required: true },
  }
);

// Apply the type at the model level

const email = mongoose.model<TEmail>(
  "Email",
  emailSchema
);
export default email;
