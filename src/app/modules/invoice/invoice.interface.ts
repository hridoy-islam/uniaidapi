import { Types } from "mongoose";

export interface TInvoice {
  reference: string;
  date: Date;

  noOfStudents: number;
  logo: string;

  customer:Types.ObjectId;
  bank:Types.ObjectId;
  students: {
    collegeRoll: string;
    refId: string;
    name: string;
    course: string;
    amount: number;
  }[];

  totalAmount: number;
  dicountType: "percentage" | "flat";
  discountAmount: number;
  discountMsg: string;
  vat: number;
  status: "due" | "paid";
  createdBy: Types.ObjectId;
  courseRelationId: Types.ObjectId; 
  year: string;
  session: string;
  semester: string;
  course: string;
  exported: boolean;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyVatNo?: string;
  companyCountry?: string;
  companyCity?: string;
  companyPostalCode?: string;
  companyState?: string;
}

