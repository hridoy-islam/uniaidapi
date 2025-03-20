import { Types } from "mongoose";

export interface TInvoice {
  reference: string;
  date: Date;

  noOfStudents: number;
  logo: string;
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
  // students: {
  //   collageroll: number;
  //   refId: string;
  //   name: string;
  //   course: string;
  //   amount: number;
  // }[];

  studens: Types.ObjectId[];
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

