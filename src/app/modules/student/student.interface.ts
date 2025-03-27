import { Types } from "mongoose";


export interface TEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
}

export interface TStudent {
  
  refId: string; 
  status: 0 |1; 
  createdBy: 
    Types.ObjectId
  ;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  collegeRoll: string ;
  dob: Date; 
  imageUrl: string;
  noDocuments: boolean;
  claimDisabilities: boolean;
  disabilitiesOption: string ;
  maritualStatus: string;
  nationality: string ;
  gender: string;
  countryResidence: string ;
  countryBirth: string ;
  nativeLanguage: string ;
  passportName: string ;
  passportIssueLocation: string ;
  passportNumber: string ;
  passportIssueDate: string ;
  passportExpiryDate: string;
  addressLine1: string;
  addressLine2: string ;
  townCity: string;
  state: string ;
  postCode: string;
  country: string;
  disabilities: string ;
  ethnicity: string ;
  genderIdentity: string ;
  sexualOrientation: string ;
  religion: string ;
  visaNeed: boolean;
  refusedPermission: boolean;
  englishLanguageRequired: boolean;
  academicHistoryRequired: boolean;
  workExperience: boolean;
  ukInPast: boolean;
  currentlyInUk: boolean;
  emergencyContact: TEmergencyContact[]; 
  academicHistory: any[]; 
  workDetails: any[]; 
  agent: Types.ObjectId; 
  documents: any[]; 
  applications: Types.ObjectId[]; 
  assignStaff: Types.ObjectId[]; 
  englishLanguageExam: any[]; 
  accounts: Types.ObjectId[]; 
}
