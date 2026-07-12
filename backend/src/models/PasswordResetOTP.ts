import mongoose, {
  Schema,
  Document,
} from "mongoose";

export interface IPasswordResetOTP
  extends Document {
  userId: mongoose.Types.ObjectId;

  otpHash: string;

  expiresAt: Date;

  used: boolean;

  createdAt: Date;
}

const passwordResetOTPSchema =
  new Schema<IPasswordResetOTP>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      otpHash: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      used: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IPasswordResetOTP>(
  "PasswordResetOTP",
  passwordResetOTPSchema
);