import { Response } from "express";

import ScholarshipApplication from "../models/ScholarshipApplication";

import { AuthRequest } from "../middleware/auth";
import { createApplicationSchema } from "../validators/application.validators";
import { updateApplicationSchema } from "../validators/application.validators";
import AuditLog from "../models/AuditLog";

export const getMyApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const applications =
      await ScholarshipApplication.find({
        applicant: req.user?.id,
      });

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

export const createApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData =
      createApplicationSchema.parse(req.body);

    const application =
      await ScholarshipApplication.create({
        applicant: req.user?.id,

        scholarshipTitle:
          validatedData.scholarshipTitle,

        personalStatement:
          validatedData.personalStatement,

        gpa: validatedData.gpa,

        annualFamilyIncome:
          validatedData.annualFamilyIncome,

        university: validatedData.university,

        program: validatedData.program,

        expectedGraduationDate:
          validatedData.expectedGraduationDate,

        achievements:
          validatedData.achievements,

        extracurricularActivities:
          validatedData.extracurricularActivities,
      });

    res.status(201).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Application creation failed",
    });

    
  }

  
};

export const getApplicationById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
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

    if (
      application.applicant.toString() !==
      req.user?.id
    ) {
      res.status(403).json({
        success: false,
        message: "Access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

export const updateApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData =
      updateApplicationSchema.parse(req.body);

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

    // Ownership check
    if (
      application.applicant.toString() !==
      req.user?.id
    ) {
      res.status(403).json({
        success: false,
        message: "Access denied",
      });
      return;
    }

    // Business Logic Security
    if (application.status !== "draft") {
      res.status(403).json({
        success: false,
        message:
          "Only draft applications can be edited",
      });
      return;
    }

    Object.assign(application, validatedData);

    await application.save();

    await AuditLog.create({
      userId: req.user?.id,
      action: "APPLICATION_UPDATED",
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
      message: "Failed to update application",
    });
  }
};