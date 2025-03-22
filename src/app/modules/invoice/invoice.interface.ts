import { Types } from "mongoose";

export interface TInvoice {
  reference: string;
  date: Date;

  noOfStudents: number;
  logo: string;

  remit:Types.ObjectId;
  students: {
    collageroll: string;
    refId: string;
    name: string;
    course: string;
    amount: number;
  }[];

  totalAmount: number;
  status: "due" | "paid";
  createdBy: Types.ObjectId;
  courseRelationId: Types.ObjectId; 
  year: string;
  session: string;
  semester: string;
  course: string;
  exported:boolean
}

