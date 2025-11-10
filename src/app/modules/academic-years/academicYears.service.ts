import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import { AcademicYearsSearchableFields } from "./academicYears.constant";
import { TAcademicYears } from "./academicYears.interface";
import AcademicYears from "./academicYears.model";



const createAcademicYearsIntoDB = async (payload: TAcademicYears) => {
  try {
    
    const result = await AcademicYears.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createAcademicYearsIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Category");
  }
};

const getAllAcademicYearsFromDB = async (query: Record<string, unknown>) => {
  const AcademicYearsQuery = new QueryBuilder(AcademicYears.find(), query)
    .search(AcademicYearsSearchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await AcademicYearsQuery.countTotal();
  const result = await AcademicYearsQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleAcademicYearsFromDB = async (id: string) => {
  const result = await AcademicYears.findById(id);
  return result;
};

const updateAcademicYearsIntoDB = async (id: string, payload: Partial<TAcademicYears>) => {
  const academicYears = await AcademicYears.findById(id);

  if (!academicYears) {
    throw new AppError(httpStatus.NOT_FOUND, "AcademicYears not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await AcademicYears.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const AcademicYearsServices = {
  getAllAcademicYearsFromDB,
  getSingleAcademicYearsFromDB,
  updateAcademicYearsIntoDB,
  createAcademicYearsIntoDB
  

};
