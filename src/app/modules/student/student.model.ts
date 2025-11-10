import mongoose, { Schema, Document } from "mongoose";
import { TStudent } from "./student.interface";
import { AnyAaaaRecord } from "dns";

// Define the Session Schema
const SessionSchema = new Schema({
  id: { type: String },
  sessionName: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  status: { type: String, enum: ["due", "paid"], default: "due" },
  invoice: { type: Boolean, default: false },
});

// Define the Year Schema (Referencing CourseRelation)
const YearSchema = new Schema({
  year: { type: String, required: true },
  sessions: { type: [SessionSchema], default: [] },
});

// Define the Account Schema (Referencing Year)
const AccountSchema = new Schema({
  courseRelationId: {
    type: Schema.Types.ObjectId,
    ref: "CourseRelation",
    required: true,
  },
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
  isActive: { type: Boolean, default: true },
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

const AgentPaymentSessionSchema = new Schema({
  id: { type: String },
  sessionName: { type: String, require: true },
  invoiceDate: { type: Date, require: true },
  status: {
    type: String,
    enum: ["due", "available", "paid"],
    default: "due",
  },
  remit: { type: Boolean, default: false },

  // amount: { type: Number, default: 0 } // Added amount field for commission tracking
});

// Add Agent Payment Year Schema (only for Year 1)
const AgentPaymentYearSchema = new Schema({
  year: { type: String, default: "Year 1" }, // Fixed to Year 1
  sessions: { type: [AgentPaymentSessionSchema], default: [] },
});

// Add Agent Payment Schema
const AgentPaymentSchema = new Schema({
  courseRelationId: {
    type: Schema.Types.ObjectId,
    ref: "CourseRelation",
    required: true,
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  years: { type: [AgentPaymentYearSchema], default: [] }, // Will only contain Year 1
});

// Define the schema for student
const StudentSchema = new Schema<TStudent>(
  {
    refId: { type: String, required: true },
    status: { type: Number, enum: [0, 1], default: 1 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    firstName: { type: String, required: true },
    imageUrl: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    collegeRoll: { type: String, default: null },
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
    academicHistory: { type: [AcademicHistorySchema] as any, default: [] },
    workDetails: { type: [WorkExperienceSchema] as any, default: [] },
    agent: { type: Schema.Types.ObjectId, ref: "User" },
    documents: {
      type: [
        {
          file_type: { type: String, required: true },
          fileUrl: { type: String, required: true },
        },
      ],
      default: [],
    },
    applications: { type: [ApplicationSchema] as any, default: [] },
    assignStaff: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    englishLanguageExam: { type: [EnglishLanguageExamSchema]as any ,default: [] },
    accounts: { type: [AccountSchema] as any, default: [] }, // Updated to use AccountSchema
    agentPayments: { type: [AgentPaymentSchema] as any, default: [] },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to populate accounts based on courseRelationId
StudentSchema.pre<TStudent>("save", async function (next) {
  if ((this as any).isNew) {
    const courseRelation = await mongoose
      .model("CourseRelation")
      .findById((this as any).courseRelationId);

    if (courseRelation) {
      // Populate the accounts field with data from CourseRelation
      this.accounts = courseRelation.accounts.map((account:any) => ({
        ...account.toObject(),
        years: account.years.map((year:any) => ({
          ...year.toObject(),
          sessions: year.sessions.map((session:any) => ({
            ...session.toObject(),
            status: "due", // Set session status to "due"
          })),
        })),
      }));
    }
  }
  next();
});

StudentSchema.pre<TStudent>("save", async function (next) {
  if ((this as any).isNew)  {
    const courseRelation = await mongoose
      .model("CourseRelation")
      .findById((this as any).courseRelationId);

    if (courseRelation) {
      // 1. Populate accounts
      this.accounts = courseRelation.accounts.map((account:any) => ({
        courseRelationId: account.courseRelationId,
        years: account.years.map((year:any) => ({
          year: year.year,
          sessions: year.sessions.map((session:any) => ({
            id: session.id,
            sessionName: session.sessionName,
            invoiceDate: session.invoiceDate,
            status: "due",
            invoice: false
          })),
        })),
      }));

      // 2. Populate agentPayments if student has an agent
      if (this.agent) {
        const year1 = courseRelation.years.find((y:any) => y.year === "Year 1");

        if (year1) {
          this.agentPayments = [
            {
              courseRelationId: courseRelation._id,
              agent: this.agent,
              years: [
                {
                  year: "Year 1",
                  sessions: year1.sessions.map((session:any) => ({
                    id: session.id,
                    name: session.sessionName,
                    invoiceDate: session.invoiceDate,
                    status: "due",
                    remit: false
                    // amount: calculateAgentCommission(session) // Implement this function
                  })),
                },
              ],
            },
          ];
        }
      }
    }
  }
  next();
});

// Add validation to ensure agentPayments only contains Year 1
StudentSchema.path("agentPayments").validate(function (payments) {
  return payments.every((payment:any) =>
    payment.years.every((year:any) => year.year === "Year 1")
  );
}, "Agent payments can only be for Year 1");

// Apply the type at the model level
const Student = mongoose.model<TStudent>("Student", StudentSchema);
export default Student;
