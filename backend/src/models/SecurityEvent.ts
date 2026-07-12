import mongoose, { Schema, Document } from "mongoose";

export interface ISecurityEvent extends Document {
  eventType: string;
  severity: "low" | "medium" | "high" | "critical";
  userId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  description: string;
  detectedAt: Date;
}

const securityEventSchema = new Schema<ISecurityEvent>({
  eventType: {
    type: String,
    required: true,
  },

  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    required: true,
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  ipAddress: String,

  description: {
    type: String,
    required: true,
  },

  detectedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ISecurityEvent>(
  "SecurityEvent",
  securityEventSchema
);