import { Types } from "mongoose";

interface Session {
  _id: Types.ObjectId; // Unique identifier for the session
  sessionName: string; // Name of the session
  invoiceDate: Date;   // Date when the invoice is issued
  type: 'flat' | 'percentage'; // Type of rate, either flat or percentage
  rate: number;        // The rate (flat amount or percentage)
}

interface Year {
  _id: Types.ObjectId; // Unique identifier for the year
  year: string;        // Year name (e.g., "Year 1")
  sessions: Session[]; // Array of sessions
}

export interface TCourseRelation {
  institute: Types.ObjectId;
  course: Types.ObjectId;
  term: Types.ObjectId;
  local: boolean;
  local_amount: string;
  international: boolean;
  international_amount: string;
  years: Year[]; // Array of Year objects
  status: 0 | 1;
}
