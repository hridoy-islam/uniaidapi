import mongoose, { Schema, Document } from "mongoose";
import { TBank } from "./bank.interface";

// Define the schema for the TRemit interface
const customerSchema = new Schema<TBank>({
  name: { type: String, required: true },
  sortCode: { type: String, required: true },
  accountNo: { type: String, required: true },
  beneficiary: { type: String },
 
});

const Bank = mongoose.model<TBank>("Bank", customerSchema);

export default Bank;
