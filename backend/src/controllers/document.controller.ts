import { Response } from "express";

import { AuthRequest } from "../middleware/auth";

import ScholarshipApplication from "../models/ScholarshipApplication";
import Document from "../models/Document";
import AuditLog from "../models/AuditLog";
import { uploadDocumentSchema } from "../validators/document.validator";
import { ZodError } from "zod";
import path from "path";
import fs from "fs";
import User from "../models/User";

export const uploadDocument = async (
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

    // Ownership Check
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

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    const validatedData =
  uploadDocumentSchema.parse(req.body);

const documentType =
  validatedData.documentType;

    const document =
      await Document.create({
        applicationId:
          application._id,

        uploadedBy:
          req.user?.id,

        documentType,

        originalName:
          req.file.originalname,

        storedFilename:
          req.file.filename,

        mimeType:
          req.file.mimetype,

        fileSize:
          req.file.size,

        filePath:
          req.file.path,
      });

    await AuditLog.create({
      userId:
        req.user?.id,

      action:
        "DOCUMENT_UPLOADED",

      targetType:
        "Document",

      targetId:
        document.id,

      ipAddress:
        req.ip,

      userAgent:
        req.headers[
          "user-agent"
        ],
    });

    res.status(201).json({
      success: true,
      document,
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
    message: "Document upload failed",
  });
}
};

export const getApplicationDocuments = async (
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

    // Ownership Validation
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

    const documents =
      await Document.find({
        applicationId: application._id,
      });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve documents",
    });
  }
};

export const getApplicationDocumentsAdmin = async (
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

    const documents =
      await Document.find({
        applicationId: application._id,
      });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve documents",
    });
  }
};

export const downloadDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const document =
      await Document.findById(req.params.id);

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    const application =
      await ScholarshipApplication.findById(
        document.applicationId
      );

    if (!application) {
      res.status(404).json({
        success: false,
        message: "Application not found",
      });
      return;
    }

    const isOwner =
      application.applicant.toString() ===
      req.user?.id;

    const user =
      await User.findById(req.user?.id);

    const isAdmin =
      user?.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: "Access denied",
      });
      return;
    }

    const filePath =
      path.resolve(document.filePath);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
      return;
    }

    await AuditLog.create({
  userId: req.user?.id,

  action: "DOCUMENT_DOWNLOADED",

  targetType: "Document",

  targetId: document.id,

  ipAddress: req.ip,

  userAgent: req.headers["user-agent"],
});

    res.download(
      filePath,
      document.originalName
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Download failed",
    });
  }
};