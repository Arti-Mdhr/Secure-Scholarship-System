import { Request, Response } from "express";
import argon2 from "argon2";
import { ZodError } from "zod";

import User from "../models/User";
import { registerSchema } from "../validators/auth.validator";
import { loginSchema } from "../validators/auth.validator";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import RefreshToken from "../models/RefreshToken";
import AuditLog from "../models/AuditLog";
import SecurityEvent from "../models/SecurityEvent";

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({
      email: validatedData.email,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    if (
      user.accountLockedUntil &&
      user.accountLockedUntil > new Date()
    ) {
      res.status(423).json({
        success: false,
        message: "Account temporarily locked",
      });
      return;
    }

    const passwordValid = await argon2.verify(
      user.passwordHash,
      validatedData.password
    );

    if (!passwordValid) {
      user.failedLoginAttempts += 1;

      await SecurityEvent.create({
        eventType: "FAILED_LOGIN",
        severity: "medium",
        userId: user._id,
        description: "Invalid login attempt",
      });

      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(
          Date.now() + 15 * 60 * 1000
        );

        await SecurityEvent.create({
          eventType: "ACCOUNT_LOCKED",
          severity: "high",
          userId: user._id,
          description:
            "Account locked due to repeated failed logins",
        });
      }

      await user.save();

      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });

      return;
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;

    await user.save();

    const accessToken = generateAccessToken(
      user.id,
      user.role
    );

    const refreshToken = generateRefreshToken(
      user.id
    );

    const refreshTokenHash =
      await argon2.hash(refreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    await AuditLog.create({
      userId: user._id,
      action: "LOGIN_SUCCESS",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

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