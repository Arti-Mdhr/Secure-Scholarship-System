import { Router } from "express";
import User from "../models/User";
import { protect } from "../middleware/auth";
import { authorize } from "../middleware/authorize";

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

export default router;