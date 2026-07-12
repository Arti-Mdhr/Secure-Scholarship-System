import { Router } from "express";
import User from "../models/User";
import { protect } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import {
  getAllApplications,
} from "../controllers/admin.controller";

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

export default router;