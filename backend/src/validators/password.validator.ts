import { z } from "zod";

export const changePasswordSchema =
  z.object({
    currentPassword: z
      .string()
      .min(8),

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