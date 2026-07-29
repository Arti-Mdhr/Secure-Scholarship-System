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
    userId: req.user?.id,
     action: "USER_DISABLED",
    targetType: "User",
    targetId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
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
  req: AuthRequest,
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
      userId: req.user?.id,
      action: "USER_ENABLED",
      targetType: "User",
      targetId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
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

export const getAllApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const applications =
      await ScholarshipApplication.find()
        .populate("applicant", "fullName email studentId")
        .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve applications",
    });
  }
};

const reviewableStatuses = [
  "under_review",
  "approved",
  "rejected",
];

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, reviewerComments } = req.body;

    if (!reviewableStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message:
          "Status must be one of: under_review, approved, rejected",
      });
      return;
    }

    const application =
      await ScholarshipApplication.findById(
        req.params.id
      );

    if (!application) {
      res.status(404).json({
        success: false,
        message: "Application not found",
      });
      return;
    }

    if (application.status === "draft") {
      res.status(400).json({
        success: false,
        message: "Cannot review an application that hasn't been submitted",
      });
      return;
    }

    application.status = status;

    if (typeof reviewerComments === "string") {
      application.reviewerComments = reviewerComments;
    }

    await application.save();

    await AuditLog.create({
      userId: req.user?.id,
      action: "APPLICATION_STATUS_UPDATED",
      targetType: "ScholarshipApplication",
      targetId: application.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update application status",
    });
  }
};
export const getAuditLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.userId) filter.userId = req.query.userId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "fullName email role")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve audit logs",
    });
  }
};
