import { Types } from "mongoose";

export interface TTerm {
  term: string
  academic_year_id: Types.ObjectId;
  status:0 |1;
}