import { Router } from "express";
import { protect, AuthRequest } from "../middleware/auth";
import User from "../models/User";

const router = Router();

router.get(
  "/me",
  protect,
  async (req: AuthRequest, res) => {
    try {
      const user = await User.findById(req.user?.id).select(
        "-passwordHash -passwordHistory -mfaSecret -emailVerificationToken"
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  }
);

export default router;