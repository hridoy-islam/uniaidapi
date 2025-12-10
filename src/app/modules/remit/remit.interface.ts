import { Types } from "mongoose";

export interface TRemit {
  reference: string;
  date: Date;

  noOfStudents: number;

  remitTo:Types.ObjectId;
  students: {
    collegeRoll: string;
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
  exported:boolean;
  adjustmentType: "percentage" | "flat" ;
  adjustmentBalance: number;
}

