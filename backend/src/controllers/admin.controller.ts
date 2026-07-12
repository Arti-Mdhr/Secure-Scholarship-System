import { Request, Response } from "express";
import ScholarshipApplication from "../models/ScholarshipApplication";

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