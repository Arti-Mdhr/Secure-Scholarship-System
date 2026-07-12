import mongoose, { Schema, Document as MDocument } from "mongoose";

export interface IDocument extends MDocument {
  applicationId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;

  documentType:
    | "transcript"
    | "recommendation_letter"
    | "identity_document";

  originalName: string;
  storedFilename: string;
  mimeType: string;
  fileSize: number;
  filePath: string;

  uploadedAt: Date;
}

const documentSchema = new Schema<IDocument>({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: "ScholarshipApplication",
    required: true,
  },

  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  documentType: {
    type: String,
    enum: [
      "transcript",
      "recommendation_letter",
      "identity_document",
    ],
    required: true,
  },

  originalName: {
    type: String,
    required: true,
  },

  storedFilename: {
    type: String,
    required: true,
  },

  mimeType: {
    type: String,
    required: true,
  },

  fileSize: {
    type: Number,
    required: true,
  },

  filePath: {
    type: String,
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IDocument>(
  "Document",
  documentSchema
);