import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

import AppError from "../../errors/AppError";
import Invoice from "./invoice.model";
import { InvoiceSearchableFields } from "./invoice.constant";
import { TInvoice } from "./invoice.interface";



const createInvoiceIntoDB = async (payload: TInvoice) => {
  try {

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}-${month}-${date}`;

    // Find the latest invoice of the day
    const lastInvoice = await Invoice.findOne({ reference: { $regex: `^${currentDate}-` } })
      .sort({ reference: -1 }) 
      .lean(); 

    let newInvoiceNumber = 1; 

    if (lastInvoice && lastInvoice.reference) {
      const lastNumber = parseInt(lastInvoice.reference.split("-").pop() || "0", 10);
      newInvoiceNumber = lastNumber + 1;
    }

    const formattedInvoiceNumber = String(newInvoiceNumber).padStart(4, "0");
    const generatedReference = `${currentDate}-${formattedInvoiceNumber}`;

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
  const userQuery = new QueryBuilder(Invoice.find(), query)
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
  const result = await Invoice.findById(id);
  return result;
};

const updateInvoiceIntoDB = async (id: string, payload: Partial<TInvoice>) => {
  const invoice = await Invoice.findById(id);

  if (!invoice) {
    throw new AppError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  // Toggle `isDeleted` status for the selected user only
  // const newStatus = !user.isDeleted;

  // // Check if the user is a company, but only update the selected user
  // if (user.role === "company") {
  //   payload.isDeleted = newStatus;
  // }

  // Update only the selected user
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
