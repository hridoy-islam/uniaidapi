import { Types } from "mongoose";

export interface TEmailLog{
  emailConfigId:Types.ObjectId,
  emailDraft: Types.ObjectId,
  studentId: Types.ObjectId;
  to: string;
  subject: string;
  body: string;
  status:"pending"|"sent";
  
  
}