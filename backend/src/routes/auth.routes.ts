import { Router } from "express";

import { register, login, setupMFA, verifyMFA, loginWithMFA, changePassword, } from "../controllers/auth.controller";
import { protect } from "../middleware/auth";



const router = Router();

router.post("/register", register);
router.post("/login", login);


router.post("/mfa/setup", protect, setupMFA);

router.post(
  "/mfa/verify",
  protect,
  verifyMFA
);

router.post(
  "/mfa/login",
  loginWithMFA
);

router.post(
  "/change-password",
  protect,
  changePassword
);

export default router;