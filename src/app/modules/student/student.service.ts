import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import { studentSearchableFields } from "./student.constant";
import { TStudent } from "./student.interface";
import Student from "./student.model";
import { User } from "../user/user.model";
import mongoose, { Types } from "mongoose";
import CourseRelation from "../course-relation/courseRelation.model";
import Term from "../term/term.model";
import AgentCourse from "../agent-course/agentCourse.model";

const generateRefId = async (): Promise<string> => {
  // Get the current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const currentDate = `STD${year}${month}${date}`;

  const lastStudent = await Student.findOne({
    refId: { $regex: `^${currentDate}` },
  })
    .sort({ refId: -1 }) // Sort in descending order to get the latest refId
    .lean();

  let newRefNumber = 1;
  if (lastStudent && lastStudent.refId) {
    // Extract the numeric part of the refId and increment it
    const lastNumber = parseInt(
      lastStudent.refId.slice(currentDate.length) || "0",
      10
    );
    newRefNumber = lastNumber + 1;
  }

  const formattedRefNumber = String(newRefNumber).padStart(4, "0");
  const generatedRefId = `${currentDate}${formattedRefNumber}`;

  return generatedRefId;
};

const createStudentIntoDB = async (payload: TStudent) => {
  try {
    payload.refId = await generateRefId();
    const result = await Student.create(payload);
    return result;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Duplicate Error: Email already exists"
      );
    }
    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create Student"
    );
  }
};

const getAllStudentFromDB = async (query: Record<string, unknown>) => {
  const {
    staffId,
    status,
    institute,
    term,
    academic_year_id,
    applicationCourse,
    year,
    createdBy,
    session,
    paymentStatus,
    agentid, 
    agentCourseRelationId, 
    agentYear,
    agentSession,
    agentPaymentStatus,
    ...otherQueryParams
  } = query;

  // Preprocess the query parameters
  const processedQuery: Record<string, unknown> = { ...otherQueryParams };

  // if (staffId) {
  //   processedQuery['assignStaff'] = staffId;
  // }

  if (staffId || createdBy) {
    processedQuery["$or"] = [];
    if (staffId) processedQuery["$or"].push({ assignStaff: staffId });
    if (createdBy) processedQuery["$or"].push({ createdBy });
  }

  if (status) {
    processedQuery["applications.status"] = { $regex: status, $options: "i" };
  }

  if (institute) {
    // Match the institute ID in the referenced `courseRelation.institute` field
    processedQuery["applications.courseRelationId"] = {
      $in: await CourseRelation.find({ institute }).distinct("_id"),
    };
  }

  if (term) {
    processedQuery["applications.courseRelationId"] = {
      $in: await CourseRelation.find({ term }).distinct("_id"),
    };
  }

  if (academic_year_id) {
    // Find all `term` documents with the matching academic_year_id
    const termIds = await Term.find({ academic_year_id }).distinct("_id");

    // Find all `courseRelation` documents that reference these term IDs
    const courseRelationIds = await CourseRelation.find({
      term: { $in: termIds },
    }).distinct("_id");

    // Match the `courseRelationId` in the `applications` array to the `courseRelation` IDs
    processedQuery["applications.courseRelationId"] = {
      $in: courseRelationIds,
    };
  }



  if (agentid || agentCourseRelationId || agentYear || agentSession || agentPaymentStatus) {
    const agentPaymentsQuery: Record<string, unknown> = {};
  

    // Convert string IDs to ObjectId if needed (match your DB schema)
    if (agentid) {
      agentPaymentsQuery["agent"] = new mongoose.Types.ObjectId(agentid);
    }
  
    if (agentCourseRelationId) {
      agentPaymentsQuery["courseRelationId"] = new mongoose.Types.ObjectId(agentCourseRelationId);
    }
  
    if (agentYear || agentSession || agentPaymentStatus) {
      const agentYearsQuery: Record<string, unknown> = {};
  
      if (agentYear) {
        agentYearsQuery["year"] = agentYear;
      }
  
      if (agentSession || agentPaymentStatus) {
        const agentSessionsQuery: Record<string, unknown> = {};
  
        if (agentSession) {
          agentSessionsQuery["sessionName"] = agentSession;
        }
  
        if (agentPaymentStatus) {
          agentSessionsQuery["status"] = agentPaymentStatus;
        }
  
        agentYearsQuery["sessions"] = { $elemMatch: agentSessionsQuery };
      }
  
      agentPaymentsQuery["years"] = { $elemMatch: agentYearsQuery };
    }
  
    // Now, use $elemMatch directly without wrapping in $and
    processedQuery["agentPayments"] = {
      $elemMatch: agentPaymentsQuery,
    };
  }
  


  if (applicationCourse || year || session || paymentStatus) {
    const accountsQuery: Record<string, unknown> = {};

    if (applicationCourse) {
      accountsQuery["courseRelationId"] = applicationCourse; // Match courseRelationId directly
    }

    if (year || session || paymentStatus) {
      const yearsQuery: Record<string, unknown> = {};

      if (year) {
        yearsQuery["year"] = year; // Match year inside years array
      }

      if (session || paymentStatus) {
        const sessionsQuery: Record<string, unknown> = {};

        if (session) {
          sessionsQuery["sessionName"] = session; // Match session inside sessions array
        }

        if (paymentStatus) {
          sessionsQuery["status"] = paymentStatus; // Match payment status inside sessions array
        }

        yearsQuery["sessions"] = { $elemMatch: sessionsQuery }; // Ensure at least one matching session
      }

      accountsQuery["years"] = { $elemMatch: yearsQuery }; // Ensure at least one matching year
    }

    processedQuery["$and"] = (processedQuery["$and"] || []).concat([
      { accounts: { $elemMatch: accountsQuery } },
    ]);
  }

  const StudentQuery = new QueryBuilder(
    Student.find().populate({
      path: "accounts.courseRelationId",
      populate: [
        {
          path: "institute",
          select: "name _id",
        },
        {
          path: "course",
          select: "name _id",
        },
        {
          path: "term",
          select: "term academic_year_id _id",
        },
      ],
    }),
    processedQuery
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await StudentQuery.countTotal();
  const result = await StudentQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleStudentFromDB = async (id: string) => {
  const result = await Student.findById(id)
    .populate("agent")
    .populate("assignStaff", "name email status")
    .populate({
      path: "applications.statusLogs",
      select: "changed_to assigned_by changed_by assigned_at created_at",
      populate: {
        path: "assigned_by",
        select: "name",
      },
    })
    .populate({
      path: "applications.statusLogs",
      populate: {
        path: "changed_by",
        select: "name",
      },
    })
    .populate({
      path: "applications.courseRelationId",
      select: "institute course term",
      populate: {
        path: "institute",
        select: "name",
      },
    })
    .populate({
      path: "applications.courseRelationId",
      populate: {
        path: "course",
        select: "name",
      },
    })
    .populate({
      path: "applications.courseRelationId",
      populate: {
        path: "term",
        select: "term",
      },
    })
    .populate("accounts.years.sessions")
    .populate({
      path: "accounts.courseRelationId",
      populate: [
        { path: "course", select: "name" },
        { path: "institute", select: "name" },
        { path: "term", select: "term" },
      ],
    }).populate("agentPayments.years.sessions")
    .populate({
      path: "agentPayments.courseRelationId",
      populate: [
        { path: "course", select: "name" },
        { path: "institute", select: "name" },
        { path: "term", select: "term" },
      ],
    });

  return result;
};

const updateStudentIntoDB = async (id: string, payload: Partial<TStudent>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(id).session(session);
    if (!student) {
      throw new AppError(httpStatus.NOT_FOUND, "Student not found");
    }

    // Handle agent assignment logic
    if (payload.agent) {
      const agent = await User.findById(payload.agent).session(session);
      if (!agent) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
      }

      if (agent.email === "m.bhuiyan@lcc.ac.uk") {
        payload.assignStaff = [student.createdBy];
      } else {
        payload.assignStaff = agent.nominatedStaffs;
      }
    }

    // Prevent duplicate courseRelationId in applications
    if (payload.applications) {
      const newApplications = Array.isArray(payload.applications) 
        ? payload.applications 
        : [payload.applications];

      for (const newApp of newApplications) {
        if (newApp.courseRelationId) {
          // Check if courseRelationId already exists in student's applications
          const duplicateExists = student.applications.some(app => 
            app.courseRelationId?.equals(newApp.courseRelationId)
          );

          if (duplicateExists) {
            // Get course details for better error message
            const courseRelation = await CourseRelation.findById(newApp.courseRelationId)
              .populate('course')
              .session(session);
            
            const courseName = courseRelation?.course?.name || 'Unknown Course';
            throw new AppError(
              httpStatus.BAD_REQUEST, 
              `Duplicate Application`
            );
          }
        }
      }
    }

    const result = await Student.findByIdAndUpdate(
      id, 
      payload, 
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    return result;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


const updateStudentApplicationIntoDB = async (
  id: string,
  appId: string,
  payload: {
    newStatus: string;
    changedBy: string;
  }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { newStatus, changedBy } = payload;

    // 1. Find the student and application
    const student = await Student.findById(id).session(session);
    if (!student) {
      throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
    }

    const application = student.applications.find(app => app._id.equals(appId));
    if (!application) {
      throw new AppError(httpStatus.NOT_FOUND, 'Application not found');
    }
    // 2. Handle status log according to your schema requirements
    const previousStatus = application.status || null;
    const isInitialStatus = !application.statusLogs || application.statusLogs.length === 0;

    const statusLog: any = {
      prev_status: previousStatus,
      changed_to: newStatus,
      created_at: new Date(),
    };

    if (isInitialStatus) {
      // For initial status - only set changed_by (not assigned fields)
      statusLog.changed_by = changedBy;
    } else {
      // For subsequent changes - track both assignment and change
      const lastLog = application.statusLogs[application.statusLogs.length - 1];
      statusLog.assigned_by = lastLog.changed_by;
      statusLog.assigned_at = lastLog.created_at;
      statusLog.changed_by = changedBy;
    }

    application.status = newStatus;
    application.statusLogs = [...(application.statusLogs || []), statusLog];



    // 3. Handle enrollment logic if status is 'Enrolled'
    if (newStatus === 'Enrolled') {
      const courseRelationId = application.courseRelationId;

      // Validation checks
      if (!student.agent) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Student has no assigned agent');
      }

      const agentCourse = await AgentCourse.findOne({
        agentId: student.agent,
        courseRelationId: courseRelationId,
        status: 1
      }).session(session);

      if (!agentCourse) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Agent is not assigned to this course ');
      }

      if (student.accounts?.some(acc => acc.courseRelationId.equals(courseRelationId))) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Student already has this course in accounts');
      }

      // Get complete course details
      const courseRelation = await CourseRelation.findById(courseRelationId)
        .populate('institute')
        .populate('course')
        .populate('term')
        .session(session);
      
      if (!courseRelation) {
        throw new AppError(httpStatus.NOT_FOUND, 'Course not found');
      }

      // Create accounts entry
      const accountsData = {
        courseRelationId: courseRelationId,
        years: courseRelation.years.map(year => ({
          year: year.year,
          sessions: year.sessions.map(session => ({
            sessionName: session.sessionName,
            invoiceDate: session.invoiceDate,
            status: 'due'
          }))
        }))
      };

      student.accounts = student.accounts || [];
      student.accounts.push(accountsData);

      // Handle agent payments - Find Year 1 data
      const year1 = courseRelation.years.find(y => y.year === "Year 1");
      if (year1) {
        student.agentPayments = student.agentPayments || [];
        
        const courseExistsInPayments = student.agentPayments.some(
          payment => payment.courseRelationId._id.equals(courseRelationId)
        );

        if (!courseExistsInPayments) {
          const agentPaymentData = {
            courseRelationId: {
              _id: courseRelation._id,
              institute: courseRelation.institute,
              course: courseRelation.course,
              term: courseRelation.term,
              local: courseRelation.local,
              local_amount: courseRelation.local_amount,
              international: courseRelation.international,
              international_amount: courseRelation.international_amount,
              status: courseRelation.status,
              years: courseRelation.years,
            },
            agent: student.agent,
            years: [{
              year: "Year 1",
              sessions: year1.sessions.map(session => ({
                sessionName: session.sessionName,
                invoiceDate: session.invoiceDate,
                status: "due",
                type: session.type,
                rate: session.rate
              }))
            }]
          };
          student.agentPayments.push(agentPaymentData);
        }
      }
    }

    await student.save({ session });
    await session.commitTransaction();
    await session.endSession();

    return {
      applicationId: application._id,
      status: application.status,
      prevStatus: previousStatus,
      ...(newStatus === 'Enrolled' && { 
        enrolledCourse: application.courseRelationId,
        accounts: student.accounts,
        agentPayments: student.agentPayments 
      })
    };

  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};


export const StudentServices = {
  getAllStudentFromDB,
  getSingleStudentFromDB,
  updateStudentIntoDB,
  createStudentIntoDB,
  updateStudentApplicationIntoDB,
};