import { Types } from "mongoose";

export interface TEmail{
  Body: string;
  Emails: string[];
  Studentid : Types.ObjectId[];
  subject:string;
  emailConfigId : Types.ObjectId[]
}