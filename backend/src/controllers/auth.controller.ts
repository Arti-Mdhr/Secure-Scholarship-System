import { Request, Response } from "express";
import argon2 from "argon2";
import { ZodError } from "zod";
import speakeasy from "speakeasy";
import QRCode from "qrcode";


import User from "../models/User";
import { registerSchema } from "../validators/auth.validator";
import { loginSchema } from "../validators/auth.validator";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import RefreshToken from "../models/RefreshToken";
import AuditLog from "../models/AuditLog";
import SecurityEvent from "../models/SecurityEvent";
import { changePasswordSchema } from "../validators/password.validator";

import { AuthRequest } from "../middleware/auth";

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

    if (user.mfaEnabled) {
  res.status(200).json({
    success: true,
    mfaRequired: true,
    userId: user.id,
  });
  return;
}

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


export const setupMFA = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(
      req.user?.id
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const secret = speakeasy.generateSecret({
      name: `Secure Scholarship (${user.email})`,
    });

    user.mfaSecret = secret.base32;

    await user.save();

    const qrCode =
      await QRCode.toDataURL(
        secret.otpauth_url as string
      );

    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCode,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to setup MFA",
    });
  }
};

export const verifyMFA = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body;

    const user = await User.findById(
      req.user?.id
    );

    if (
      !user ||
      !user.mfaSecret
    ) {
      res.status(400).json({
        success: false,
        message:
          "MFA setup not found",
      });
      return;
    }

    const verified =
      speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token,
      });

    if (!verified) {
      await SecurityEvent.create({
        eventType: "MFA_FAILURE",
        severity: "medium",
        userId: user._id,
        description:
          "Invalid MFA code",
      });

      res.status(401).json({
        success: false,
        message:
          "Invalid MFA code",
      });
      return;
    }

    user.mfaEnabled = true;

    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "MFA_ENABLED",
      ipAddress: req.ip,
      userAgent:
        req.headers["user-agent"],
    });

    await SecurityEvent.create({
      eventType: "MFA_ENABLED",
      severity: "low",
      userId: user._id,
      description:
        "User enabled MFA",
    });

    res.status(200).json({
      success: true,
      message:
        "MFA enabled successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "MFA verification failed",
    });
  }
};

export const loginWithMFA = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);

    if (
      !user ||
      !user.mfaSecret ||
      !user.mfaEnabled
    ) {
      res.status(400).json({
        success: false,
        message: "MFA not enabled",
      });
      return;
    }

    const verified =
      speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token,
      });

    if (!verified) {
      await SecurityEvent.create({
        eventType: "MFA_FAILURE",
        severity: "medium",
        userId: user._id,
        description:
          "Invalid MFA login code",
      });

      res.status(401).json({
        success: false,
        message: "Invalid MFA code",
      });
      return;
    }

    const accessToken =
      generateAccessToken(
        user.id,
        user.role
      );

    const refreshToken =
      generateRefreshToken(
        user.id
      );

    const refreshTokenHash =
      await argon2.hash(
        refreshToken
      );

    await RefreshToken.create({
      userId: user._id,
      tokenHash:
        refreshTokenHash,
      expiresAt: new Date(
        Date.now() +
          7 *
            24 *
            60 *
            60 *
            1000
      ),
    });

    await AuditLog.create({
      userId: user._id,
      action:
        "LOGIN_SUCCESS_MFA",
      ipAddress: req.ip,
      userAgent:
        req.headers[
          "user-agent"
        ],
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
      message:
        "MFA login failed",
    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData =
      changePasswordSchema.parse(req.body);

    const user = await User.findById(
      req.user?.id
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const currentPasswordValid =
      await argon2.verify(
        user.passwordHash,
        validatedData.currentPassword
      );

    if (!currentPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    // Password Reuse Prevention
    for (const oldHash of user.passwordHistory) {
      const reused =
        await argon2.verify(
          oldHash,
          validatedData.newPassword
        );

      if (reused) {
        res.status(400).json({
          success: false,
          message:
            "You cannot reuse a previous password",
        });
        return;
      }
    }

    const newPasswordHash =
      await argon2.hash(
        validatedData.newPassword
      );

    user.passwordHash =
      newPasswordHash;

    user.passwordHistory.push(
      newPasswordHash
    );

    // Keep last 5 passwords
    if (
      user.passwordHistory.length > 5
    ) {
      user.passwordHistory =
        user.passwordHistory.slice(-5);
    }

    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: "PASSWORD_CHANGED",
      ipAddress: req.ip,
      userAgent:
        req.headers["user-agent"],
    });

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
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
      message:
        "Password change failed",
    });
  }
};