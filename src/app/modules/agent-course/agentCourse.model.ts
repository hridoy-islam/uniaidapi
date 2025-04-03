import mongoose, { Schema, Document, Types } from "mongoose";
import { TAgentCourse } from "./agentCourse.interface";

// Define the session schema
const sessionSchema = new Schema({
  sessionName: { type: String },
  invoiceDate: { type: Date },
  type: { type: String, enum: ["flat", "percentage"] },
  rate: { type: Number },
});

// Define the agent course schema
// Define the main schema for the AgentCourse
const agentCourseSchema = new Schema<TAgentCourse>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseRelationId: { type: Schema.Types.ObjectId, ref: "CourseRelation", required: true },
    

    // Define the year field as an array of session documents
    year: {
      type: [
        { sessionName: { type: String }, invoiceDate: { type: Date }, type: { type: String }, rate: { type: Number } },
      ],
      validate: [arrayLimit, '{PATH} exceeds the limit of 3 sessions'],
      default: [
        { sessionName: 'Session 1', invoiceDate: '', type: 'flat', rate: 0 },
        { sessionName: 'Session 2', invoiceDate: '', type: 'flat', rate: 0 },
        { sessionName: 'Session 3', invoiceDate: '', type: 'flat', rate: 0 },

      ],
    },

    status: { type: Number, enum: [0, 1], default: 1 },
  },
  { timestamps: true }
);

// Custom validation to ensure the `year` array contains exactly 3 sessions
function arrayLimit(val: any[]) {
  return val.length === 3;
}


// Populate the year field before saving
// agentCourseSchema.pre("save", async function (next) {
//   const courseRelation = await mongoose
//     .model("CourseRelation")
//     .findById(this.courseRelationId)
//     .exec();
//   if (
//     courseRelation &&
//     courseRelation.years &&
//     courseRelation.years[0] &&
//     courseRelation.years[0].sessions
//   ) {
//     const sessions = courseRelation.years[0].sessions.map((session: any) => ({
//       sessionName: session.sessionName,
//       invoiceDate: session.invoiceDate,
//       type: "flat",
//       rate: "",
//     }));
//     this.year = sessions; // Assigning sessions from the first year
//   }
//   next();
// });

agentCourseSchema.pre("save", async function (next) {
  const courseRelation = await mongoose
    .model("CourseRelation")
    .findById(this.courseRelationId)
    .exec();

  if (courseRelation && courseRelation.years) {
    const year1Data = courseRelation.years.find(
      (year: any) => year.year === "Year 1"
    );

    if (year1Data && year1Data.sessions) {
      const sessions = year1Data.sessions.map((session: any) => ({
        sessionName: session.sessionName,
        invoiceDate: session.invoiceDate,
        type: "flat",  // Default type
        rate: "",      // Default empty rate
      }));
      this.year = sessions;
    }
  }
  next();
});

// Apply the type at the model level
const AgentCourse = mongoose.model<TAgentCourse>(
  "AgentCourse",
  agentCourseSchema
);

export default AgentCourse;
