import { z } from "zod";

export const requestPasswordResetSchema =
  z.object({
    email: z
      .string()
      .email(),
  });

export const resetPasswordSchema =
  z.object({
    email: z
      .string()
      .email(),

    otp: z
      .string()
      .length(
        6,
        "OTP must be 6 digits"
      ),

    newPassword: z
      .string()
      .min(
        12,
        "Password must be at least 12 characters"
      )
      .regex(
        /[A-Z]/,
        "Must contain uppercase letter"
      )
      .regex(
        /[a-z]/,
        "Must contain lowercase letter"
      )
      .regex(
        /[0-9]/,
        "Must contain number"
      )
      .regex(
        /[^A-Za-z0-9]/,
        "Must contain special character"
      ),
  });