import mongoose, { Types } from "mongoose";

export interface TCSV {
  companyId: mongoose.Types.ObjectId;
  transactions: {
    date: string;
    description: string;
    paidOut: number;
    paidIn: number;
  }[];
}
