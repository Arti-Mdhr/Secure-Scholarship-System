import { Request, Response } from "express";
import ScholarshipApplication from "../models/ScholarshipApplication";
import AuditLog from "../models/AuditLog";

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
    const {
      status,
      reviewerComments,
    } = req.body;

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

    application.status = status;
    application.reviewerComments =
      reviewerComments;

    await application.save();

    await AuditLog.create({
      action: "APPLICATION_REVIEWED",
      targetType:
        "ScholarshipApplication",
      targetId: application.id,
    });

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Review failed",
    });
  }
};