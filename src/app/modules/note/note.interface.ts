import { Types } from "mongoose";

export interface TComment {
  user: Types.ObjectId; 
  comment: string; 
  createdAt: Date;
}

export interface TNote {

  student: Types.ObjectId;
  note: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  followUpBy?: Types.ObjectId[];
  comment: TComment[];
  isFollowUp: Boolean;
  status: "pending" | "complete"
}


