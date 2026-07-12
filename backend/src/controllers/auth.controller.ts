import { Request, Response } from "express";
import argon2 from "argon2";
import { ZodError } from "zod";

import User from "../models/User";
import { registerSchema } from "../validators/auth.validator";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingEmail = await User.findOne({
      email: validatedData.email,
    });

    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }

    const existingStudentId = await User.findOne({
      studentId: validatedData.studentId,
    });

    if (existingStudentId) {
      res.status(409).json({
        success: false,
        message: "Student ID already exists",
      });
      return;
    }

    const passwordHash = await argon2.hash(
      validatedData.password
    );

    const user = await User.create({
      fullName: validatedData.fullName,
      email: validatedData.email,

      passwordHash,

      passwordHistory: [passwordHash],

      studentId: validatedData.studentId,
      university: validatedData.university,
      program: validatedData.program,
      academicLevel: validatedData.academicLevel,

      phoneNumber: validatedData.phoneNumber,
      dateOfBirth: validatedData.dateOfBirth,
      country: validatedData.country,
      address: validatedData.address,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        email: user.email,
      },
    });
  }catch (error) {

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      errors: error.issues,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: "Registration failed",
  });
}
};