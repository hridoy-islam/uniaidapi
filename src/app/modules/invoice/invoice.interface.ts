import { Types } from "mongoose";

export interface TInvoice {
  reference: string; 
  date: Date;
  semester: string; 
  noOfStudents: number;
  Logo: string;
  remitTo: {
    name: string;
    email: string;
    address: string;
  };
  paymentInfo: {
    sortCode: string;
    accountNo: string;
    beneficiary: string;
  };
  students: {
    collageroll: number;
    refId: string;
    name: string;
    course: string;
    amount: number;
  }[];
  totalAmount: number;
  Status: "due" | "paid"; 
  createdBy: Types.ObjectId; 
  courseRelationId: Types.ObjectId; 
  Year: string; 
  Session: string; 
}

