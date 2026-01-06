/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from "bcrypt";
import { Schema, model, Types } from "mongoose";
import config from "../../config";
import { UserStatus } from "./user.constant";
import { TUser, UserModel } from "./user.interface";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
    },
    contact: {
      type: String,
    },
    location: {
      type: String,
    },

    location2: { type: String },
    city: { type: String },
    state: { type: String },
    postCode: { type: String },
    country: { type: String },

    role: {
      type: String,
      enum: ["admin", "agent", "staff"],
      default: "agent",
    },
    organization: {
      type: String,
    },
    nominatedStaffs: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    agentCourseRelations: [
      {
        type: Types.ObjectId,
        ref: "CourseRelation",
      },
    ],
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    imgUrl: { type: String },

    contactPerson: {
      type: String,
      default: "",
    },
    vatNo: { type: String, default: "" },

    sortCode: { type: String },
    accountNo: { type: String },
    beneficiary: { type: String },
    privileges: {
      management: {
        course: {
          type: Boolean,
          default: false,
        },
        term: {
          type: Boolean,
          default: false,
        },
        institution: {
          type: Boolean,
          default: false,
        },
        academicYear: {
          type: Boolean,
          default: false,
        },
        courseRelation: {
          type: Boolean,
          default: false,
        },
        emails: {
          type: Boolean,
          default: false,
        },
        drafts: {
          type: Boolean,
          default: false,
        },
        invoices: {
          type: Boolean,
          default: false,
        },
        remit: {
          type: Boolean,
          default: false,
        },
        staffs: {
          type: Boolean,
          default: false,
        },
        agent: {
          type: Boolean,
          default: false,
        },
        bank: {
          type: Boolean,
          default: false,
        },
      },
      student: {
        assignStaff: {
          type: Boolean,
          default: false,
        },
        account: {
          type: Boolean,
          default: false,
        },
        agentChange: {
          type: Boolean,
          default: false,
        },
        applicationStatus: {
          type: Boolean,
          default: false,
        },
        search: {
          agent: {
            type: Boolean,
            default: false,
          },
          staff: {
            type: Boolean,
            default: false,
          },
        },
        communication: {
          type: Boolean,
          default: false,
        },
        notes: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to hash the password before saving
userSchema.pre("save", async function (next) {
  const user = this; // doc
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds)
    );
  }
  next();
});

// set '' after saving password
userSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

userSchema.statics.isUserExists = async function (email: string) {
  return await User.findOne({ email }).select("+password");
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, UserModel>("User", userSchema);
