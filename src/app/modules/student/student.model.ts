import mongoose, { Schema, Document } from "mongoose";
import { TStudent } from "./student.interface";
import { User } from "../user/user.model";

// Define the Session Schema
const SessionSchema = new Schema({
  id: { type: String, required: true },
  sessionName: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  status: { type: String, enum: ["due", "paid"], default: "due" },
});

// Define the Year Schema (Referencing CourseRelation)
const YearSchema = new Schema({
  
  year: { type: String, required: true },
  sessions: { type: [SessionSchema], default: [] },
});

// Define the Account Schema (Referencing Year)
const AccountSchema = new Schema({
  courseRelationId: { type: Schema.Types.ObjectId, ref: "CourseRelation", required: true },
  years: { type: [YearSchema], default: [] },
});

// Define the schema for status logs
const StatusLogSchema = new Schema({
  prev_status: { type: String },
  changed_to: { type: String },
  assigned_by: { type: Schema.Types.ObjectId, ref: "User" },
  changed_by: { type: Schema.Types.ObjectId, ref: "User" },
  assigned_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

// Define the schema for applications
const ApplicationSchema = new Schema({
  courseRelationId: { type: Schema.Types.ObjectId, ref: "CourseRelation" },
  choice: { type: String },
  amount: { type: String },
  status: { type: String, default: "New" },
  statusLogs: { type: [StatusLogSchema], default: [] },
  created_at: { type: Date, default: Date.now },
});

// Define the schema for emergency contact
const EmergencyContactSchema = new Schema({
  name: { type: String },
  relationship: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  status: { type: Number, enum: [0, 1], default: 1 },
});

// Define the schema for academic history
const AcademicHistorySchema = new Schema({
  institution: { type: String },
  course: { type: String },
  studyLevel: { type: String },
  resultScore: { type: String },
  outOf: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  status: { type: Number, enum: [0, 1], default: 1 },
});

// Define the schema for English language exam
const EnglishLanguageExamSchema = new Schema({
  exam: { type: String },
  examDate: { type: Date },
  score: { type: String },
  status: { type: Number, enum: [0, 1], default: 1 },
});

// Define the schema for work experience
const WorkExperienceSchema = new Schema({
  jobTitle: { type: String },
  organization: { type: String },
  address: { type: String },
  phone: { type: String },
  fromData: { type: String },
  toData: { type: String },
  currentlyWorking: { type: Boolean, default: false },
  status: { type: Number, enum: [0, 1], default: 1 },
});

// Define the schema for student
const StudentSchema = new Schema<TStudent>(
  {
    refId: { type: String, required: true },
    status: { type: Number, enum: [0, 1], default: 1 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    firstName: { type: String, required: true },
    imageUrl:{type: String},
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    collageRoll: { type: String, default: null },
    dob: { type: Date, required: true },
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
    workDetails: { type: [WorkExperienceSchema], default: [] },
    agent: { type: Schema.Types.ObjectId, ref: "User" },
    documents: { type: [
      {
        file_type: { type: String, required: true },
        fileUrl: { type: String, required: true },
      }
    ], default: [] },
    applications: { type: [ApplicationSchema], default: [] },
    assignStaff: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    englishLanguageExam: { type: [EnglishLanguageExamSchema], default: [] },
    accounts: { type: [AccountSchema], default: [] }, // Updated to use AccountSchema
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to populate accounts based on courseRelationId
StudentSchema.pre<TStudent>("save", async function (next) {
  if (this.isNew) {
    // Fetch the CourseRelation document based on courseRelationId
    const courseRelation = await mongoose.model("CourseRelation").findById(this.courseRelationId);

    if (courseRelation) {
      // Populate the accounts field with data from CourseRelation
      this.accounts = courseRelation.accounts.map(account => ({
        ...account.toObject(),
        years: account.years.map(year => ({
          ...year.toObject(),
          sessions: year.sessions.map(session => ({
            ...session.toObject(),
            status: "due", // Set session status to "due"
          })),
        })),
      }));
    }
  }
  next();
});

// Apply the type at the model level
const Student = mongoose.model<TStudent>("Student", StudentSchema);
export default Student;