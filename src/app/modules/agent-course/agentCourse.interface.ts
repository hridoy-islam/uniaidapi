import { Types } from "mongoose";

interface Session {

  sessionName: string; 
  invoiceDate: Date;   
  type: 'flat' | 'percentage'; 
  rate: number;       
}



export interface TAgentCourse {
  agentId: Types.ObjectId;
  courseRelationId: Types.ObjectId;
  
  year: any[]; 
  status: 0 | 1;
}
