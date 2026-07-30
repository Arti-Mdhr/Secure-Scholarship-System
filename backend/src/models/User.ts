import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;

  emailVerified: boolean;
  emailVerificationToken?: string;

  passwordHash?: string;

  authProvider: "local" | "google";
  googleId?: string;
  profilePicture?: string;

  studentId?: string;
  university?: string;
  program?: string;
  academicLevel?: string;

  phoneNumber?: string;
  dateOfBirth?: Date;
  country?: string;
  address?: string;

  role: "student" | "admin";

  mfaEnabled: boolean;
  mfaSecret?: string;

  passwordHistory: string[];

  failedLoginAttempts: number;
  accountLockedUntil?: Date;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
    },

    passwordHash: {
      type: String,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
    },

    profilePicture: {
      type: String,
    },

    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    university: {
      type: String,
    },

    program: {
      type: String,
    },

    academicLevel: {
      type: String,
    },

    phoneNumber: {
      type: String,
    },

    dateOfBirth: {
      type: Date,
    },

    country: {
      type: String,
    },

    address: {
      type: String,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    mfaEnabled: {
      type: Boolean,
      default: false,
    },

    mfaSecret: {
      type: String,
    },

    passwordHistory: {
      type: [String],
      default: [],
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    accountLockedUntil: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);