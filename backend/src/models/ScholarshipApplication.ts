import mongoose, { Schema, Document } from "mongoose";

export interface IScholarshipApplication extends Document {
  applicant: mongoose.Types.ObjectId;

  scholarshipTitle: string;

  personalStatement: string;

  gpa: number;

  annualFamilyIncome: number;

  university: string;

  program: string;

  expectedGraduationDate: Date;

  achievements: string;

  extracurricularActivities: string;

  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected";

  reviewerComments?: string;

  submittedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const scholarshipApplicationSchema =
  new Schema<IScholarshipApplication>(
    {
      applicant: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      scholarshipTitle: {
        type: String,
        required: true,
      },

      personalStatement: {
        type: String,
        required: true,
      },

      gpa: {
        type: Number,
        required: true,
      },

      annualFamilyIncome: {
        type: Number,
        required: true,
      },

      university: {
        type: String,
        required: true,
      },

      program: {
        type: String,
        required: true,
      },

      expectedGraduationDate: {
        type: Date,
        required: true,
      },

      achievements: {
        type: String,
        required: true,
      },

      extracurricularActivities: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "draft",
          "submitted",
          "under_review",
          "approved",
          "rejected",
        ],
        default: "draft",
      },

      reviewerComments: String,

      submittedAt: Date,
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IScholarshipApplication>(
  "ScholarshipApplication",
  scholarshipApplicationSchema
);