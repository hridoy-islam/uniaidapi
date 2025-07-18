import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";
import RemitInvoice from "./remit.model";
import { RemitInvoiceSearchableFields } from "./remit.constant";
import { TRemit } from "./remit.interface";
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

const createRemitInvoiceIntoDB = async (payload: TRemit) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}${month}${date}`; // Removed '-'

    // Find the latest invoice of the day
    const lastInvoice = await RemitInvoice.findOne({
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
    const result = await RemitInvoice.create(payload);

    // 🔄 Update each student to mark remit = true
    for (const studentData of payload.students) {
      const student = await Student.findOne({ refId: studentData.refId });
      if (!student) continue;

      for (const agentPayment of student.agentPayments) {
        if (
          agentPayment.courseRelationId.toString() !==
          payload.courseRelationId.toString()
        )
          continue;

        for (const yearObj of agentPayment.years) {
          if (yearObj.year !== "Year 1") continue;

          for (const sessionObj of yearObj.sessions) {
            if (sessionObj.sessionName === payload.session) {
              sessionObj.remit = true;
            }
          }
        }
      }

      await student.save(); // Save updated student
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

const getAllRemitInvoiceFromDB = async (query: Record<string, unknown>) => {
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
    RemitInvoice.find()
      .populate("remitTo")
      .populate({
        path: "courseRelationId",
        populate: [
          { path: "course", select: "name" },
          { path: "institute", select: "name" },
          { path: "term", select: "term" },
        ],
      }),
    processedQuery
  )
    .search(RemitInvoiceSearchableFields)
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

const getSingleRemitInvoiceFromDB = async (id: string) => {
  const result = await RemitInvoice.findById(id)
    .populate({
      path: "courseRelationId",
      populate: [
        { path: "course", select: "name" },
        { path: "institute", select: "name" },
        { path: "term", select: "term" },
      ],
    })
    .populate("students", "refId	firstName lastName collegeRoll")
    .populate("remitTo");

  return result;
};

const updateRemitInvoiceIntoDB = async (
  id: string,
  payload: Partial<TRemit>
) => {
  const remit = await RemitInvoice.findById(id);

  if (!remit) {
    throw new AppError(httpStatus.NOT_FOUND, "Remit not found");
  }

  // Update the Remit status
  if (payload.status === "paid" && remit.status !== "paid") {
    if (remit.students && remit.students.length > 0) {
      const studentRefIds = remit.students.map((student) => student.refId);
      const session = remit.session;

      try {
        await Student.updateMany(
          {
            refId: { $in: studentRefIds },
            "agentPayments.courseRelationId": remit.courseRelationId,
            "agentPayments.years.year": "Year 1", // Agent payments are only for Year 1
            "agentPayments.years.sessions.sessionName": session, // Match session ID
          },
          {
            $set: {
              "agentPayments.$[payment].years.$[year].sessions.$[session].status":
                "paid",
            },
          },
          {
            arrayFilters: [
              { "payment.courseRelationId": remit.courseRelationId },
              { "year.year": "Year 1" },
              { "session.sessionName": session },
            ],
          }
        );
      } catch (error) {
        console.error("Error updating student agent payments:", error);
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Mark as Paid not Done"
        );
      }
    }
  }

  // Handle student list changes (add/remove) - separate from payment logic
  if (payload.students && remit.students) {
    const currentStudentRefIds = remit.students.map((student) => student.refId);
    const newStudentRefIds = payload.students.map((student) => student.refId);

    const session = remit.session;
    const courseRelationId = remit.courseRelationId;

    // Find added students
    const addedStudentRefIds = newStudentRefIds.filter(
      (refId) => !currentStudentRefIds.includes(refId)
    );

    // Find removed students
    const removedStudentRefIds = currentStudentRefIds.filter(
      (refId) => !newStudentRefIds.includes(refId)
    );

    try {
      // Handle added students - set their remit status to true
      if (addedStudentRefIds.length > 0) {
        await Student.updateMany(
          {
            refId: { $in: addedStudentRefIds },
            "agentPayments.courseRelationId": courseRelationId,
            "agentPayments.years.year": "Year 1",
            "agentPayments.years.sessions.sessionName": session,
          },
          {
            $set: {
              "agentPayments.$[payment].years.$[year].sessions.$[session].remit":
                true,
            },
          },
          {
            arrayFilters: [
              { "payment.courseRelationId": courseRelationId },
              { "year.year": "Year 1" },
              { "session.sessionName": session },
            ],
          }
        );
      }

      // Handle removed students - set their remit status to false
      if (removedStudentRefIds.length > 0) {
        await Student.updateMany(
          {
            refId: { $in: removedStudentRefIds },
            "agentPayments.courseRelationId": courseRelationId,
            "agentPayments.years.year": "Year 1",
            "agentPayments.years.sessions.sessionName": session,
          },
          {
            $set: {
              "agentPayments.$[payment].years.$[year].sessions.$[session].remit":
                false,
            },
          },
          {
            arrayFilters: [
              { "payment.courseRelationId": courseRelationId },
              { "year.year": "Year 1" },
              { "session.sessionName": session },
            ],
          }
        );
      }
    } catch (error) {
      console.error("Error updating student remit status:", error);
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to update student remit status"
      );
    }
  }

  // Update the remit itself
  const result = await RemitInvoice.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const RemitInvoiceServices = {
  getAllRemitInvoiceFromDB,
  getSingleRemitInvoiceFromDB,
  updateRemitInvoiceIntoDB,
  createRemitInvoiceIntoDB,
};
