import { Router } from "express";

import { protect } from "../middleware/auth";
import { adminOnly } from "../middleware/admin";

import {
  getAllUsers,
  disableUser,
  enableUser,
  getAdminStats,
  getSecurityEvents,
} from "../controllers/admin.controller";

const router = Router();

router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

router.patch(
  "/users/:id/disable",
  protect,
  adminOnly,
  disableUser
);

router.patch(
  "/users/:id/enable",
  protect,
  adminOnly,
  enableUser
);

router.get(
  "/stats",
  protect,
  adminOnly,
  getAdminStats
);

router.get(
  "/security-events",
  protect,
  adminOnly,
  getSecurityEvents
);
export default router;