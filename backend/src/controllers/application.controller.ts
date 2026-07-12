import { Response } from "express";

import ScholarshipApplication from "../models/ScholarshipApplication";

import { AuthRequest } from "../middleware/auth";
import { createApplicationSchema } from "../validators/application.validators";

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