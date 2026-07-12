import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  action: {
    type: String,
    required: true,
  },

  targetType: String,
  targetId: String,

  ipAddress: String,

  userAgent: String,

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IAuditLog>(
  "AuditLog",
  auditLogSchema
);