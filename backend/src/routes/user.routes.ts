import { Router } from "express";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

router.get(
  "/me",
  protect,
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);

export default router;