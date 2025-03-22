import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";
import Invoice from "./invoice.model";
import { InvoiceSearchableFields } from "./invoice.constant";
import { TInvoice } from "./invoice.interface";
import Student from "../student/student.model";
import moment from "moment";

// const updateStudentAccounts = async (
//   students,
//   courseRelationId,
//   year,
//   session,
//   status
// ) => {
//   try {
//     if (!students.length) return;

//     const studentRefIds = students.map((student) => student.refId);

//     const result = await Student.updateMany(
//       {
//         refId: { $in: studentRefIds }, // Match students by refId
//         "accounts.courseRelationId": courseRelationId, // Match the courseRelationId inside accounts array
//         "accounts.years.year": year, // Match the correct year
//         "accounts.years.sessions.sessionName": session, // Match the correct session
//       },
//       {
//         $set: {
//           "accounts.$[account].years.$[year].sessions.$[session].status": status, // Update status inside sessions array
//         },
//       },
//       {
//         arrayFilters: [
//           { "account.courseRelationId": courseRelationId }, // Ensure the correct account
//           { "years.year": year }, // Ensure the correct year
//           { "session.sessionName": session }, // Ensure the correct session
//         ],
//       }
//     );

//     console.log(`${result.modifiedCount} student accounts updated to ${status}`);
//   } catch (error) {
//     console.error("Error updating student account payment status:", error);
//   }
// };

const createInvoiceIntoDB = async (payload: TInvoice) => {
  try {

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}${month}${date}`; // Removed '-'
    
    // Find the latest invoice of the day
    const lastInvoice = await Invoice.findOne({ reference: { $regex: `^${currentDate}` } })
      .sort({ reference: -1 }) 
      .lean(); 
    
    let newInvoiceNumber = 1;
    
    if (lastInvoice && lastInvoice.reference) {
      const lastNumber = parseInt(lastInvoice.reference.slice(currentDate.length) || "0", 10);
      newInvoiceNumber = lastNumber + 1;
    }
    
    const formattedInvoiceNumber = String(newInvoiceNumber).padStart(4, "0");
    const generatedReference = `${currentDate}${formattedInvoiceNumber}`;

    // Attach generated reference to payload
    payload.reference = generatedReference;

    // Create the invoice
    const result = await Invoice.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createInvoiceIntoDB:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Invoice");
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

  const userQuery = new QueryBuilder(Invoice.find().populate("remit"), processedQuery)
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
    }).populate("students", "refId	firstName lastName collageRoll").populate("remit");

  return result;
};

const updateInvoiceIntoDB = async (id: string, payload: Partial<TInvoice>) => {
  const invoice = await Invoice.findById(id);

  if (!invoice) {
    throw new AppError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  // Update the invoice status

  if (payload.status === "paid" && invoice.status !== "paid") {
    // Directly update student accounts when invoice status is changed to "paid"
    if (invoice.students && invoice.students.length > 0) {
      const studentRefIds = invoice.students.map((student) => student.refId);

      // Ensure year and session values are correct
      const year = invoice.year;
      const session = invoice.session;

      // Perform the update directly on the students' accounts
      try {
        const updateResult = await Student.updateMany(
          {
            refId: { $in: studentRefIds }, // Match students by refId
            "accounts.courseRelationId": invoice.courseRelationId, // Match the courseRelationId
            "accounts.years.year": year, // Match the correct year
            "accounts.years.sessions.sessionName": session, // Match the correct session
          },
          {
            $set: {
              "accounts.$[account].years.$[year].sessions.$[session].status": "paid", // Update session status to "paid"
            },
          },
          {
            arrayFilters: [
              { "account.courseRelationId": invoice.courseRelationId }, // Ensure the correct account
              { "year.year": year }, // Ensure the correct year
              { "session.sessionName": session }, // Ensure the correct session
            ],
          }
        );

      } catch (error) {
        throw new AppError(httpStatus.NOT_FOUND, "Mark as Paid not Done");

      }
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
