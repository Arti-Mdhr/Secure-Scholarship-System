import { Router } from "express";

import { register, login, setupMFA, verifyMFA, loginWithMFA, changePassword,requestPasswordReset, resetPassword , logout,refreshAccessToken, verifyEmail} from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import {
  loginLimiter,
  mfaLimiter,
  passwordResetLimiter,
  passwordResetRequestLimiter,
  refreshLimiter,
} from "../middleware/rateLimiter";
import { verifyRecaptcha } from "../middleware/recaptcha";


const router = Router();

router.post(
  "/register",
   loginLimiter,
  // verifyRecaptcha,
  register
);

router.post(
  "/login",
  loginLimiter,
  //  verifyRecaptcha,
  login
);
router.post(
  "/request-password-reset",
  passwordResetRequestLimiter,
  // verifyRecaptcha,
  requestPasswordReset
  
);

router.get(
  "/verify-email/:token",
  verifyEmail
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
  refreshLimiter,
  refreshAccessToken
);


export default router;