import AppError from "../../errors/AppError";
import mongoose from "mongoose";
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import { csvSarchableFields } from "./csv.constant";
import { TCSV } from "./csv.interface";
import  CSV from "./csv.model";
import moment from "moment";
import Student from "../student/student.model";

// Creates a new CSV in the database
// const createCSVIntoDB = async (payload: TCSV) => {
//   try {
//     // Ensure studentData exists and is an array
//     if (!Array.isArray(payload?.studentData)) {
//       throw new AppError(httpStatus.BAD_REQUEST, "Invalid student data");
//     }

//     // Map through studentData to attach studentId if available
//     const updatedStudentData = await Promise.all(
//       payload?.studentData.map(async (student) => {
//         let studentId = null;

//         if (student.phone) {
//           const existingStudent = await Student.findOne({ phone: student.phone });
//           if (existingStudent) {
//             studentId = existingStudent._id;
//           }
//         }

//         return {
//           ...student,
//           studentId: studentId || undefined, // avoid sending null or ""
//         };
//       })
//     );

//     // Create the CSV document with the updated studentData
//     const result = await CSV.create({
//       ...payload,
//       studentData: updatedStudentData,
//     });

//     return result;
//   } catch (error: any) {
//     console.error("Error in createCSVIntoDB:", error);

//     if (error instanceof AppError) {
//       throw error;
//     }

//     throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create CSV");
//   }
// };


const createCSVIntoDB = async (payload: TCSV) => {
  try {
    if (!Array.isArray((payload as any)?.studentData)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid student data");
    }

    // Step 1: Extract all raw phone numbers
    const phoneNumbers = (payload as any).studentData
      .map((s:any) => s.phone?.trim())
      .filter(Boolean);

    // Step 2: Query existing students
    const existingStudents = await Student.find({
      phone: { $in: phoneNumbers },
    }).lean();

    // Step 3: Create phone -> studentId map
    const phoneToStudentIdMap = new Map(
      existingStudents.map((s) => [s.phone?.trim(), s._id])
    );

    // Step 4: Debug unmatched phones
    const unmatched = phoneNumbers.filter((p:any) => !phoneToStudentIdMap.has(p));
    if (unmatched.length > 0) {
      console.warn("⚠️ Unmatched phones:", unmatched);
    }

    // Step 5: Update studentData
    const updatedStudentData = (payload as any).studentData.map((student:any) => ({
      ...student,
      studentId: phoneToStudentIdMap.get(student.phone?.trim()) || undefined,
    }));

    // Step 6: Create the CSV
    const result = await CSV.create({
      ...payload,
      studentData: updatedStudentData,
    });

    return result;
  } catch (error: any) {
    console.error("❌ Error in createCSVIntoDB:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create CSV");
  }
};


const deleteCSVFromDB = async (id: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid ID format");
    }

    const existingCSV = await CSV.findById(id);
    if (!existingCSV) {
      throw new AppError(httpStatus.NOT_FOUND, "CSV not found!");
    }

    const result = await CSV.findByIdAndDelete(id );

    if (!result) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete the CSV");
    }

    return result;
  } catch (error) {
    console.error("Error in deleteCSVFromDB:", error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete CSV");
  }
};

// Updates an CSV in the database by ID
const updateCSVInDB = async (csvId: string, studentId: string) => {
  const result = await CSV.findByIdAndUpdate(
    csvId,
    { $pull: { studentData: { _id: studentId } } },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "CSV document not found or student doesn't exist");
  }

  return result;
};






// Retrieves all CSVs from the database with filtering, sorting, and pagination
const getAllCSVsFromDB = async (query: Record<string, unknown>) => {

  const CSVQuery = new QueryBuilder(CSV.find().populate("studentData.studentId","title firstName lastName email phone dob refId"), query)
    .search(csvSarchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await CSVQuery.countTotal();
  const result = await CSVQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// Retrieves all CSVs for a specific company with filtering, sorting, and pagination
const getAllCompanyCSVsFromDB = async (companyId: string, query: Record<string, unknown>) => {
  const { fromDate, toDate, searchTerm, ...otherQueryParams } = query;

  // Initialize base query with companyId and isDeleted
  const baseQuery: any = { 
    companyId,
    isDeleted: false 
  };

  // Apply date filters directly to the base query
  if (fromDate && toDate) {
    baseQuery.CSVDate = {
      $gte: moment(fromDate).startOf('day').toDate(),
      $lte: moment(toDate).endOf('day').toDate()
    };
  } else if (fromDate) {
    baseQuery.CSVDate = {
      $gte: moment(fromDate).startOf('day').toDate()
    };
  } else if (toDate) {
    baseQuery.CSVDate = {
      $lte: moment(toDate).endOf('day').toDate()
    };
  }

  // Initialize QueryBuilder with the base query
  const CSVQuery = new QueryBuilder(
    CSV.find(baseQuery).populate("companyId","name").populate("customer"),
    otherQueryParams
  );

  // Handle search term if provided
  if (searchTerm) {
    const searchTermStr = searchTerm.toString();
    CSVQuery.modelQuery = CSVQuery.modelQuery.or([
      { CSVNumber: { $regex: searchTermStr, $options: 'i' } },
      { details: { $regex: searchTermStr, $options: 'i' } },
      { 'customer.name': { $regex: searchTermStr, $options: 'i' } },
      { 'customer._id': searchTermStr }
    ]);
  }

  // Apply other QueryBuilder methods
  const finalQuery = CSVQuery
    .filter(query)
    .sort()
    .paginate()
    .fields();

  // Get results
  const meta = await finalQuery.countTotal();
  const result = await finalQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// Retrieves a single CSV from the database by ID
const getOneCSVFromDB = async (id: string) => {
  const result = await CSV.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "CSV not found!");
  }
  return result;
};

export const CSVServices = {
  createCSVIntoDB,
  deleteCSVFromDB,
  updateCSVInDB,
  getAllCSVsFromDB,
  getOneCSVFromDB,
  getAllCompanyCSVsFromDB,
 
};
