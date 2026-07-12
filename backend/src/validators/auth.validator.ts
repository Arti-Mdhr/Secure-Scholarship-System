import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(3).max(100),

    email: z.email(),

    password: z
      .string()
      .min(12)
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[^A-Za-z0-9]/, "Must contain special character"),

    confirmPassword: z.string(),

    studentId: z.string().min(3),

    university: z.string().min(2),

    program: z.string().min(2),

    academicLevel: z.string(),

    phoneNumber: z.string().min(7),

    dateOfBirth: z.string(),

    country: z.string(),

    address: z.string().min(5),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;