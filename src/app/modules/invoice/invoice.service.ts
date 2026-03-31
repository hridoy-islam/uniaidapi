import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";
import Invoice from "./invoice.model";
import { InvoiceSearchableFields } from "./invoice.constant";
import { TInvoice } from "./invoice.interface";
import Student from "../student/student.model";
import moment from "moment";
import { User } from "../user/user.model";
import RemitInvoice from "../remit/remit.model";
import AgentCourse from "../agent-course/agentCourse.model";
import CourseRelation from "../course-relation/courseRelation.model";

const createInvoiceIntoDB = async (payload: TInvoice) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}${month}${date}`;

    // Find the latest invoice of the day
    const lastInvoice = await Invoice.findOne({
      reference: { $regex: `^${currentDate}` },
    })
      .sort({ reference: -1 })
      .lean();

    let newInvoiceNumber = 1;

    if (lastInvoice && lastInvoice.reference) {
      const lastNumber = parseInt(
        lastInvoice.reference.slice(currentDate.length) || "0",
        10,
      );
      newInvoiceNumber = lastNumber + 1;
    }

    const formattedInvoiceNumber = String(newInvoiceNumber).padStart(4, "0");
    const generatedReference = `${currentDate}${formattedInvoiceNumber}`;

    // Attach generated reference to payload
    payload.reference = generatedReference;
    let user = null;
    if (payload.createdBy) {
      user = await User.findById(payload.createdBy).lean();
    }

    // Map user fields to payload company fields, defaulting to "" if missing
    payload.companyName = user?.name || "";
    payload.companyAddress = user?.location || "";
    payload.companyEmail = user?.email || "";
    payload.companyCountry = user?.country || "";
    payload.companyCity = user?.city || "";
    payload.companyPostalCode = user?.postCode || "";
    payload.companyState = user?.state || "";
    payload.companyVatNo = user?.vatNo || "";

    // Create the invoice
    const result = await Invoice.create(payload);

    for (const studentData of payload.students) {
      const student = await Student.findOne({ refId: studentData.refId });

      if (!student) continue;

      for (const account of student.accounts) {
        if (
          (account as any).courseRelationId.toString() !==
          payload.courseRelationId.toString()
        )
          continue;

        const yearObj = (account as any).years.find(
          (y: any) => y.year === payload.year,
        );
        if (!yearObj) continue;

        const sessionObj = yearObj.sessions.find(
          (s: any) => s.sessionName === payload.session,
        );
        if (!sessionObj) continue;

        sessionObj.invoice = true;
      }

      await student.save();
    }

    return result;
  } catch (error: any) {
    console.error("Error in createInvoiceIntoDB:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to create Invoice",
    );
  }
};

const getAllInvoiceFromDB = async (query: Record<string, unknown>) => {
  const { fromDate, toDate, ...otherQueryParams } = query;

  const processedQuery: Record<string, unknown> = { ...otherQueryParams };

  if (fromDate && toDate) {
    processedQuery["createdAt"] = {
      $gte: moment(fromDate).startOf("day").toDate(), // Start of the day for fromDate
      $lte: moment(toDate).endOf("day").toDate(), // End of the day for toDate
    };
  } else if (fromDate) {
    processedQuery["createdAt"] = {
      $gte: moment(fromDate).startOf("day").toDate(), // Start of the day for fromDate
    };
  } else if (toDate) {
    processedQuery["createdAt"] = {
      $lte: moment(toDate).endOf("day").toDate(), // End of the day for toDate
    };
  }

  const userQuery = new QueryBuilder(
    Invoice.find()
      .populate("customer")
      .populate("createdBy", "sortCode, location, name, email, imgUrl")
      .populate("bank")
      .populate({
        path: "courseRelationId",
        populate: [
          { path: "course", select: "name" },
          { path: "institute", select: "name" },
          { path: "term", select: "term" },
        ],
      }),
    processedQuery,
  )
    .search(InvoiceSearchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleInvoiceFromDB = async (id: string) => {
  const result = await Invoice.findById(id)
    .populate({
      path: "courseRelationId",
      populate: [
        { path: "course", select: "name" },
        { path: "institute", select: "name" },
        { path: "term", select: "term" },
      ],
    })
    .populate("students", "refId firstName lastName collegeRoll")
    .populate("customer")
    .populate(
      "createdBy",
      "sortCode location name email imgUrl accountNo location2 city postCode state country",
    )
    .populate("bank");

  return result;
};

const updateInvoiceIntoDB = async (id: string, payload: Partial<TInvoice>) => {
  const invoice = await Invoice.findById(id);

  if (!invoice) {
    throw new AppError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  // Update the invoice status
  if (payload.status === "paid" && invoice.status !== "paid") {
    if (invoice.students && invoice.students.length > 0) {
      const studentRefIds = invoice.students.map((student) => student.refId);
      const year = invoice.year;
      const session = invoice.session;

      try {
        // First update student accounts
        const updateResult = await Student.updateMany(
          {
            refId: { $in: studentRefIds },
            "accounts.courseRelationId": invoice.courseRelationId,
            "accounts.years.year": year,
            "accounts.years.sessions.sessionName": session,
          },
          {
            $set: {
              "accounts.$[account].years.$[year].sessions.$[session].status":
                "paid",
            },
          },
          {
            arrayFilters: [
              { "account.courseRelationId": invoice.courseRelationId },
              { "year.year": year },
              { "session.sessionName": session },
            ],
          },
        );

        // Then update agent payments for each student
        await Student.updateMany(
          {
            refId: { $in: studentRefIds },
            "agentPayments.courseRelationId": invoice.courseRelationId,
            "agentPayments.years.year": "Year 1", // Agent payments are only for Year 1
            "agentPayments.years.sessions.sessionName": session, // Match session ID
          },
          {
            $set: {
              "agentPayments.$[payment].years.$[year].sessions.$[session].status":
                "available",
            },
          },
          {
            arrayFilters: [
              { "payment.courseRelationId": invoice.courseRelationId },
              { "year.year": "Year 1" },
              { "session.sessionName": session },
            ],
          },
        );
      } catch (error) {
        console.error(
          "Error updating student accounts or agent payments:",
          error,
        );
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Mark as Paid not Done",
        );
      }
    }
  }

  // Handle student list changes (add/remove) - separate from payment logic
  if (payload.students && invoice.students) {
    const currentStudentRefIds = invoice.students.map(
      (student) => student.refId,
    );
    const newStudentRefIds = payload.students.map((student) => student.refId);

    const year = invoice.year;
    const session = invoice.session;
    const courseRelationId = invoice.courseRelationId;

    // Find added students
    const addedStudentRefIds = newStudentRefIds.filter(
      (refId) => !currentStudentRefIds.includes(refId),
    );

    // Find removed students
    const removedStudentRefIds = currentStudentRefIds.filter(
      (refId) => !newStudentRefIds.includes(refId),
    );

    try {
      // Handle added students - set their invoice status to true
      if (addedStudentRefIds.length > 0) {
        await Student.updateMany(
          {
            refId: { $in: addedStudentRefIds },
            "accounts.courseRelationId": courseRelationId,
            "accounts.years.year": year,
            "accounts.years.sessions.sessionName": session,
          },
          {
            $set: {
              "accounts.$[account].years.$[year].sessions.$[session].invoice":
                true,
            },
          },
          {
            arrayFilters: [
              { "account.courseRelationId": courseRelationId },
              { "year.year": year },
              { "session.sessionName": session },
            ],
          },
        );
      }

      // Handle removed students - set their invoice status to false
      if (removedStudentRefIds.length > 0) {
        await Student.updateMany(
          {
            refId: { $in: removedStudentRefIds },
            "accounts.courseRelationId": courseRelationId,
            "accounts.years.year": year,
            "accounts.years.sessions.sessionName": session,
          },
          {
            $set: {
              "accounts.$[account].years.$[year].sessions.$[session].invoice":
                false,
            },
          },
          {
            arrayFilters: [
              { "account.courseRelationId": courseRelationId },
              { "year.year": year },
              { "session.sessionName": session },
            ],
          },
        );
      }
    } catch (error) {
      console.error("Error updating student invoice status:", error);
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to update student invoice status",
      );
    }
  }

  const result = await Invoice.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const generateRemitFromInvoice = async (
  invoiceId: string,
  createdByUserId: string,
) => {
  // 1. Fetch the invoice
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new AppError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  if (invoice.generatedRemit) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Remit already generated for this invoice"
    );
  }

  // VALIDATION: Agents are only paid for Year 1
  if (invoice.year !== "Year 1") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot generate remit. Agent commissions are only applicable for Year 1."
    );
  }

  // VALIDATION: Invoice must be paid
  if (invoice.status !== "paid") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot generate remit. Invoice must be paid first.",
    );
  }

  // Fetch CourseRelation and populate the course to get the course name later
  const courseRelation = await CourseRelation.findById(invoice.courseRelationId).populate("course");
  
  if (!courseRelation) {
    throw new AppError(
      httpStatus.NOT_FOUND, 
      "Associated Course Relation not found for this invoice"
    );
  }

  // 2. Fetch all students from this invoice to check their agents
  const studentRefIds = invoice.students.map((s) => s.refId);
  const students = await Student.find({ refId: { $in: studentRefIds } });

  // Extract unique agent IDs to fetch AgentCourse data optimally
  const agentIds = [
    ...new Set(students.map((s) => s.agent?.toString()).filter(Boolean)),
  ];

  // Fetch all relevant AgentCourse documents for this courseRelationId
  const agentCourses = await AgentCourse.find({
    agentId: { $in: agentIds },
    courseRelationId: invoice.courseRelationId,
  });

  // 3. Group students by Agent and calculate their commission amounts
  const agentGroups: Record<string, any[]> = {};

  for (const invStudent of invoice.students) {
    const student = students.find((s) => s.refId === invStudent.refId);

    // VALIDATION: Agent must exist for every student on the invoice
    if (!student || !student.agent) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Agent ID is not available for student: ${invStudent.firstName} ${invStudent.lastName} (${invStudent.refId})`,
      );
    }

    // VALIDATION: Check if this student's session is already remitted
    const hasAlreadyRemitted = (student as any).agentPayments?.some((payment: any) => {
      if (payment.courseRelationId.toString() !== invoice.courseRelationId.toString()) {
        return false;
      }
      
      return payment.years.some((yearObj: any) => {
        if (yearObj.year !== "Year 1") return false;
        
        return yearObj.sessions.some((sessionObj: any) => {
          const isMatchingSession = sessionObj.name === invoice.session || sessionObj.sessionName === invoice.session;
          return isMatchingSession && sessionObj.remit === true; 
        });
      });
    });

    if (hasAlreadyRemitted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Commission for student ${invStudent.firstName} ${invStudent.lastName} (${invStudent.refId}) has already been remitted for ${invoice.session}.`
      );
    }

    const agentId = student.agent.toString();

    // Calculate amount from AgentCourse
    let commissionAmount = 0;
    const agentCourse = agentCourses.find(
      (ac) => ac.agentId.toString() === agentId,
    );

    if (agentCourse && agentCourse.year) {
      const sessionConfig = agentCourse.year.find(
        (s: any) => s.sessionName === invoice.session,
      );

      if (sessionConfig && sessionConfig.rate) {
        if (sessionConfig.type === "percentage") {
          commissionAmount =
            (Number(sessionConfig.rate) / 100) * invStudent.amount;
        } else {
          commissionAmount = Number(sessionConfig.rate);
        }
      }
    }

    if (!agentGroups[agentId]) {
      agentGroups[agentId] = [];
    }

    agentGroups[agentId].push({
      collegeRoll: invStudent.collegeRoll,
      refId: invStudent.refId,
      firstName: invStudent.firstName,
      lastName: invStudent.lastName,
      course: invStudent.course,
      amount: commissionAmount,
    });
  }

  const createdRemits = [];

  // --- REFERENCE GENERATION PREP ---
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const currentDate = `${year}${month}${date}`;

  // Find the latest invoice of the day ONCE before the loop
  const lastInvoice = await RemitInvoice.findOne({
    reference: { $regex: `^${currentDate}` },
  })
    .sort({ reference: -1 })
    .lean();

  let currentInvoiceNumber = 1;

  if (lastInvoice && lastInvoice.reference) {
    const lastNumber = parseInt(
      lastInvoice.reference.slice(currentDate.length) || "0",
      10,
    );
    currentInvoiceNumber = lastNumber + 1;
  }
  // ---------------------------------

  // 4. Generate a RemitInvoice for each Agent
  for (const [agentId, agentStudents] of Object.entries(agentGroups)) {
    const totalAmount = agentStudents.reduce((sum, s) => sum + s.amount, 0);

    // Apply the sequential reference number
    const formattedInvoiceNumber = String(currentInvoiceNumber).padStart(
      4,
      "0",
    );
    const generatedReference = `${currentDate}${formattedInvoiceNumber}`;

    // Increment for the next agent in the loop
    currentInvoiceNumber++;

    const remitPayload = {
      reference: generatedReference,
      date: new Date(),
      noOfStudents: agentStudents.length,
      remitTo: agentId,
      students: agentStudents,
      totalAmount: totalAmount,
      status: "due",
      createdBy: createdByUserId,
      courseRelationId: invoice.courseRelationId,
      year: invoice.year,
      session: invoice.session,
      semester: invoice.semester,
      // Extract the name from the populated course object
      course: (courseRelation.course as any)?.name || "", 
    };

    const result = await RemitInvoice.create(remitPayload);
    createdRemits.push(result);

    // 5. Update each student to mark remit = true
    for (const studentData of agentStudents) {
      const studentToUpdate = await Student.findOne({
        refId: studentData.refId,
      });
      if (!studentToUpdate) continue;

      for (const agentPayment of (studentToUpdate as any).agentPayments) {
        if (
          agentPayment.courseRelationId.toString() !==
          invoice.courseRelationId.toString()
        )
          continue;

        for (const yearObj of agentPayment.years) {
          if (yearObj.year !== "Year 1") continue;

          for (const sessionObj of yearObj.sessions) {
            // Check matching session string
            if (
              sessionObj.name === invoice.session ||
              sessionObj.sessionName === invoice.session
            ) {
              sessionObj.remit = true;
            }
          }
        }
      }
      await studentToUpdate.save();
    }
  }
  
  await Invoice.findByIdAndUpdate(
    invoiceId,
    { generatedRemit: true },
  );
  
  return createdRemits;
};

export const InvoiceServices = {
  getAllInvoiceFromDB,
  getSingleInvoiceFromDB,
  updateInvoiceIntoDB,
  createInvoiceIntoDB,
  generateRemitFromInvoice,
};
