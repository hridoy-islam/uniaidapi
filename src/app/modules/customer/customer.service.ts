import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";

import { customerSearchableFields } from "./customer.constant";
import { TCustomer } from "./customer.interface";
import Customer from "./customer.model";



const createCustomerIntoDB = async (payload: TCustomer) => {
  try {
    
    const result = await Customer.create(payload);
    return result;
  } catch (error: any) {
    console.error("Error in createCustomerIntoDB:", error);

    // Throw the original error or wrap it with additional context
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message || "Failed to create Customer");
  }
};

const getAllCustomerFromDB = async (query: Record<string, unknown>) => {
  const CustomerQuery = new QueryBuilder(Customer.find(), query)
    .search(customerSearchableFields)
    .filter(query)
    .sort()
    .paginate()
    .fields();

  const meta = await CustomerQuery.countTotal();
  const result = await CustomerQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleCustomerFromDB = async (id: string) => {
  const result = await Customer.findById(id);
  return result;
};

const updateCustomerIntoDB = async (id: string, payload: Partial<TCustomer>) => {
  const customer = await Customer.findById(id);

  if (!customer) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
  const result = await Customer.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};






export const CustomerServices = {
  getAllCustomerFromDB,
  getSingleCustomerFromDB,
  updateCustomerIntoDB,
  createCustomerIntoDB
  

};
