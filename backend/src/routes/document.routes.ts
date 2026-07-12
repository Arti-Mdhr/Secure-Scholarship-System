import { Router } from "express";

import { protect } from "../middleware/auth";

import upload from "../middleware/upload";

import {
  uploadDocument,
  getApplicationDocuments,
  downloadDocument
} from "../controllers/document.controller";

const router = Router();

router.post(
  "/applications/:id/documents",
  protect,
  upload.single("file"),
  uploadDocument
);

router.get(
  "/applications/:id/documents",
  protect,
  getApplicationDocuments
);

router.get(
  "/documents/:id/download",
  protect,
  downloadDocument
);

export default router;