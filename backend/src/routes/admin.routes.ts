import { Router } from "express";
import User from "../models/User";
import { protect } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import {
  getAllApplications,
  reviewApplication,
} from "../controllers/admin.controller";
import { getApplicationDocumentsAdmin } from "../controllers/document.controller";

const router = Router();

router.get(
  "/users",
  protect,
  authorize("admin"),
  async (req, res) => {
    const users = await User.find().select(
      "-passwordHash -passwordHistory -mfaSecret"
    );

    res.json({
      success: true,
      users,
    });
  }
);

router.get(
  "/applications",
  protect,
  authorize("admin"),
  getAllApplications
);

router.patch(
  "/applications/:id/review",
  protect,
  authorize("admin"),
  reviewApplication
);

router.get(
  "/applications/:id/documents",
  protect,
  authorize("admin"),
  getApplicationDocumentsAdmin
);

export default router;