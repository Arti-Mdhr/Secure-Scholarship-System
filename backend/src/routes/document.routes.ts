import { Router } from "express";

import { protect } from "../middleware/auth";

import upload from "../middleware/upload";

import {
  uploadDocument,
} from "../controllers/document.controller";

const router = Router();

router.post(
  "/applications/:id/documents",
  protect,
  upload.single("file"),
  uploadDocument
);

export default router;