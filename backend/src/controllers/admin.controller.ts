import { Request, Response } from "express";
import { ZodError } from "zod";

import ScholarshipApplication from "../models/ScholarshipApplication";
import AuditLog from "../models/AuditLog";
import { reviewApplicationSchema } from "../validators/admin.validator";

export const getAllApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const applications =
      await ScholarshipApplication.find()
        .populate(
          "applicant",
          "fullName email studentId"
        );

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

export const reviewApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData =
      reviewApplicationSchema.parse(req.body);

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

    application.status =
      validatedData.status;

    application.reviewerComments =
      validatedData.reviewerComments;

    await application.save();

    await AuditLog.create({
      action: "APPLICATION_REVIEWED",
      targetType:
        "ScholarshipApplication",
      targetId: application.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      success: true,
      application,
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
      message: "Review failed",
    });
  }
};