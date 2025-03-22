import mongoose, { Schema, Document } from "mongoose";
import { TRemit } from "./remit.interface";

// Define the schema for the TRemit interface
const remitSchema = new Schema<TRemit>(
  {
    logo: { type: String,  },
    name: { type: String,  },
    email: { type: String,  },
    address: { type: String,  },
    sortCode: { type: String,  },
    accountNo: { type: String,  },
    beneficiary: { type: String,  },
  },
 
);

const Remit = mongoose.model<TRemit>("Remit", remitSchema);

export default Remit;
