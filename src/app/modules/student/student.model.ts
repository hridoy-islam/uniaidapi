import mongoose, { Schema, Document, CallbackError, Types } from "mongoose";
import { TStudent } from "./student.interface";
import { User } from "../user/user.model";

const EmergencyContactSchema = new Schema({
  name: { type: String },
  relationship: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
});

const AcademicHistorySchema = new Schema({
  institution: { type: String },
  course: { type: String },
  studyLevel: { type: String },
  resultScore: { type: String },
  outOf: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
});

const englishLanguageExamSchema = new Schema({
  exam: { type: String },
  examDate: { type: Date },
  score: { type: String },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
});

const workExperienceSchema = new Schema({
  jobTitle: { type: String },
  organization: { type: String },
  address: { type: String },
  phone: { type: String },
  fromData: { type: String },
  toData: { type: String },
  currentlyWorking: { type: Boolean, default: false },
  status: {
    type: Number,
    enum: [0, 1],
    default: 1,
  },
});


// const assignStaffSchema = new

const StudentSchema = new Schema<TStudent>({
  refId: { type: String, required: true },
  status: { type: Number, enum: [0, 1], default: 1 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  collageRoll: { type: String, default: null },
  dob: { type: String, required: true },
  noDocuments: { type: Boolean, default: false },
  claimDisabilities: { type: Boolean, default: false },
  disabilitiesOption: { type: String, default: null },
  maritualStatus: { type: String, required: true },
  nationality: { type: String, default: null },
  gender: { type: String, required: true },
  countryResidence: { type: String, default: null },
  countryBirth: { type: String, default: null },
  nativeLanguage: { type: String, default: null },
  passportName: { type: String, default: null },
  passportIssueLocation: { type: String, default: null },
  passportNumber: { type: String, default: null },
  passportIssueDate: { type: String, default: null },
  passportExpiryDate: { type: String, default: null },
  addressLine1: { type: String },
  addressLine2: { type: String, default: null },
  townCity: { type: String },
  state: { type: String, default: null },
  postCode: { type: String },
  country: { type: String },
  disabilities: { type: String, default: null },
  ethnicity: { type: String, default: null },
  genderIdentity: { type: String, default: null },
  sexualOrientation: { type: String, default: null },
  religion: { type: String, default: null },
  visaNeed: { type: Boolean, default: false },
  refusedPermission: { type: Boolean, default: false },
  englishLanguageRequired: { type: Boolean, default: false },
  academicHistoryRequired: { type: Boolean, default: false },
  workExperience: { type: Boolean, default: false },
  ukInPast: { type: Boolean, default: false },
  currentlyInUk: { type: Boolean, default: false },
  emergencyContact: { type: [EmergencyContactSchema], default: [] },
  academicHistory: { type: [AcademicHistorySchema], default: [] },
  workDetails: { type: [workExperienceSchema], default: [] },
  agent: { type: Schema.Types.ObjectId, ref: "User" },
  documents: { type: [String], default: [] },
  applications: { type: [String], default: [] },
  assignStaff: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }], // Updated to store ObjectId references
  englishLanguageExam: { type: [englishLanguageExamSchema], default: [] },
  accounts: [{ type: Schema.Types.ObjectId, ref: "Account" }],
});


// Apply the type at the model level
const Student = mongoose.model<TStudent>("Student", StudentSchema);
export default Student;