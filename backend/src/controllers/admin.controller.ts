import { Request, Response } from "express";

import User from "../models/User";
import AuditLog from "../models/AuditLog";
import ScholarshipApplication from "../models/ScholarshipApplication";
import SecurityEvent from "../models/SecurityEvent";
import { AuthRequest } from "../middleware/auth";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find()
      .select("-passwordHash -passwordHistory -mfaSecret");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

export const disableUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {if (req.user?.id === req.params.id) {
  res.status(400).json({
    success: false,
    message: "You cannot disable your own account.",
  });
  return;
}
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    user.isActive = false;

    await user.save();

    await AuditLog.create({
      action: "USER_DISABLED",
      targetType: "User",
      targetId: user.id,
    });

    res.status(200).json({
      success: true,
      message: "User disabled",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to disable user",
    });
  }
};

export const enableUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    user.isActive = true;

    await user.save();

    await AuditLog.create({
      action: "USER_ENABLED",
      targetType: "User",
      targetId: user.id,
    });

    res.status(200).json({
      success: true,
      message: "User enabled",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to enable user",
    });
  }
};

export const getAdminStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const totalUsers =
      await User.countDocuments();

    const activeUsers =
      await User.countDocuments({
        isActive: true,
      });

    const disabledUsers =
      await User.countDocuments({
        isActive: false,
      });

    const totalApplications =
      await ScholarshipApplication.countDocuments();

    const approvedApplications =
      await ScholarshipApplication.countDocuments({
        status: "approved",
      });

    const rejectedApplications =
      await ScholarshipApplication.countDocuments({
        status: "rejected",
      });

    const pendingApplications =
      await ScholarshipApplication.countDocuments({
        status: { $in: ["submitted", "under_review"] },
      });

    res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        activeUsers,
        disabledUsers,

        totalApplications,
        approvedApplications,
        rejectedApplications,
        pendingApplications,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve statistics",
    });
  }
};

export const getSecurityEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const events =
      await SecurityEvent.find()
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve security events",
    });
  }
};