import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";
import Invoice from "./invoice.model";
import { InvoiceSearchableFields } from "./invoice.constant";
import { TInvoice } from "./invoice.interface";
import Student from "../student/student.model";
import moment from "moment";


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
        10
      );
      newInvoiceNumber = lastNumber + 1;
    }

    const formattedInvoiceNumber = String(newInvoiceNumber).padStart(4, "0");
    const generatedReference = `${currentDate}${formattedInvoiceNumber}`;

    // Attach generated reference to payload
    payload.reference = generatedReference;

    // Create the invoice
    const result = await Invoice.create(payload);

    for (const studentData of payload.students) {
      const student = await Student.findOne({ refId: studentData.refId });

      if (!student) continue;

      for (const account of student.accounts) {
        if (
          account.courseRelationId.toString() !==
          payload.courseRelationId.toString()
        )
          continue;

        const yearObj = account.years.find((y) => y.year === payload.year);
        if (!yearObj) continue;

        const sessionObj = yearObj.sessions.find(
          (s) => s.sessionName === payload.session
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
      error.message || "Failed to create Invoice"
    );
  }
};


const getAllInvoiceFromDB = async (query: Record<string, unknown>) => {

  const {
   
    fromDate,
    toDate,
    ...otherQueryParams
  } = query;

  const processedQuery: Record<string, unknown> = { ...otherQueryParams };


  if (fromDate && toDate) {
    processedQuery['createdAt'] = {
      $gte: moment(fromDate).startOf('day').toDate(),  // Start of the day for fromDate
      $lte: moment(toDate).endOf('day').toDate(),      // End of the day for toDate
    };
  } else if (fromDate) {
    processedQuery['createdAt'] = {
      $gte: moment(fromDate).startOf('day').toDate(),  // Start of the day for fromDate
    };
  } else if (toDate) {
    processedQuery['createdAt'] = {
      $lte: moment(toDate).endOf('day').toDate(),      // End of the day for toDate
    };
  }

  const userQuery = new QueryBuilder(Invoice.find().populate("customer").populate("createdBy","sortCode, location, name, email, imgUrl").populate('bank').populate({
      path: "courseRelationId",
      populate: [
        { path: "course", select: "name" },
        { path: "institute", select: "name" },
        { path: "term", select: "term" },
      ],
    }), processedQuery)
    .search(InvoiceSearchableFields)
    .filter()
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
    .populate("createdBy", "sortCode location name email imgUrl accountNo location2 city postCode state country") .populate('bank');
   

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
              "accounts.$[account].years.$[year].sessions.$[session].status": "paid",
            },
          },
          {
            arrayFilters: [
              { "account.courseRelationId": invoice.courseRelationId },
              { "year.year": year },
              { "session.sessionName": session },
            ],
          }
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
              "agentPayments.$[payment].years.$[year].sessions.$[session].status": "available",
            },
          },
          {
            arrayFilters: [
              { "payment.courseRelationId": invoice.courseRelationId },
              { "year.year": "Year 1" },
              { "session.sessionName": session },
            ],
          }
        );
      } catch (error) {
        console.error("Error updating student accounts or agent payments:", error);
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Mark as Paid not Done");
      }
    }
  }

  // Handle student list changes (add/remove) - separate from payment logic
  if (payload.students && invoice.students) {
    const currentStudentRefIds = invoice.students.map((student) => student.refId);
    const newStudentRefIds = payload.students.map((student) => student.refId);
    
    const year = invoice.year;
    const session = invoice.session;
    const courseRelationId = invoice.courseRelationId;

    // Find added students
    const addedStudentRefIds = newStudentRefIds.filter(
      refId => !currentStudentRefIds.includes(refId)
    );

    // Find removed students
    const removedStudentRefIds = currentStudentRefIds.filter(
      refId => !newStudentRefIds.includes(refId)
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
              "accounts.$[account].years.$[year].sessions.$[session].invoice": true,
            },
          },
          {
            arrayFilters: [
              { "account.courseRelationId": courseRelationId },
              { "year.year": year },
              { "session.sessionName": session },
            ],
          }
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
              "accounts.$[account].years.$[year].sessions.$[session].invoice": false,
            },
          },
          {
            arrayFilters: [
              { "account.courseRelationId": courseRelationId },
              { "year.year": year },
              { "session.sessionName": session },
            ],
          }
        );
      }
    } catch (error) {
      console.error("Error updating student invoice status:", error);
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update student invoice status");
    }
  }

  const result = await Invoice.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};




export const InvoiceServices = {
  getAllInvoiceFromDB,
  getSingleInvoiceFromDB,
  updateInvoiceIntoDB,
  createInvoiceIntoDB
  

};
