import { Router } from "express";

import { register, login, setupMFA, verifyMFA, loginWithMFA, changePassword,requestPasswordReset, resetPassword , logout,refreshAccessToken,} from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import {
  loginLimiter,
  mfaLimiter,
  passwordResetLimiter,
  passwordResetRequestLimiter,
  refreshLimiter,
} from "../middleware/rateLimiter";


const router = Router();

router.post("/register", register);
router.post(
  "/login",
  loginLimiter,
  login
);
router.post(
  "/request-password-reset",
  passwordResetRequestLimiter,
  requestPasswordReset
);

router.post("/mfa/setup", protect, setupMFA);

router.post(
  "/mfa/verify",
  protect,
  verifyMFA
);

router.post(
  "/mfa/login",
  mfaLimiter,
  loginWithMFA
);
router.post(
  "/change-password",
  protect,
  changePassword
);

router.post(
  "/reset-password",
    passwordResetLimiter,
  resetPassword
);

router.post(
  "/logout",
  protect,
  logout
);

router.post(
  "/refresh",
  refreshAccessToken
);


export default router;