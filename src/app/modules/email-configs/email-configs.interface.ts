import { Types } from "mongoose";

export interface TEmailConfig{
  email: string;
  host: string;
  port: Number;
  encryption:string;
  authentication: boolean;
  password:string
}