/* eslint-disable no-unused-vars */
import { Model, Types } from "mongoose";
import { USER_ROLE } from "./user.constant";

// export interface TUser {
//   _id: Types.ObjectId;
//   name: string;
//   email: string;
//   password: string;
//   role: "user" | "admin" | "company" | "creator" | "director";
//   status: "block" | "active";
//   company?: Types.ObjectId;
//   colleagues?: Types.ObjectId[];
//   isDeleted: boolean;
//   authorized: boolean;
//   address?: string;
//   image?: string;
//   phone?: string;
//   googleUid?: string;
//   otp?:string;
//   refreshToken?:string
// }


export interface TUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  contact: string; 
  location: string;
  role: "admin" | "agent" | "staff" 
  organization: string;
  nominatedStaffs: Types.ObjectId[]; 
  status: 0 | 1; 
  isDeleted:boolean;
  contactPerson?: string;
  location2?:string;
  city?: string;
  state?:string;
  postCode?:string;
  country?:string;
  imgUrl?:string;
  sortCode?: string;
 accountNo?: string;
 beneficiary?:string;
  privileges: {
    management: {
      course: boolean;
      term: boolean;
      institution: boolean;
      academicYear: boolean;
      courseRelation: boolean;
      emails: boolean;
      drafts: boolean;
      invoices: boolean;
      staffs: boolean;
      agent: boolean;
    };
    student: {
      assignStaff: boolean;
      account: boolean;
      agentChange: boolean;
      applicationStatus: boolean;
      search: {
        agent: boolean;
        staff: boolean;
      };
      communication: boolean;
      notes: boolean;
    };
  };
}


export interface UserModel extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExists(email: string): Promise<TUser>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  // isJWTIssuedBeforePasswordChanged(
  //   passwordChangedTimestamp: Date,
  //   jwtIssuedTimestamp: number,
  // ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
