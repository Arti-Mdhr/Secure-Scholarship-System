import { Router } from "express";

import { protect } from "../middleware/auth";
import { adminOnly } from "../middleware/admin";

import {
  getAllUsers,
  disableUser,
  enableUser,
  getAdminStats,
  getSecurityEvents,
  getAllApplications,
  updateApplicationStatus,
  getAuditLogs,
} from "../controllers/admin.controller";

import { getApplicationDocumentsAdmin } from "../controllers/document.controller";

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

router.get(
  "/applications",
  protect,
  adminOnly,
  getAllApplications
);

router.patch(
  "/applications/:id/status",
  protect,
  adminOnly,
  updateApplicationStatus
);

router.get(
  "/applications/:id/documents",
  protect,
  adminOnly,
  getApplicationDocumentsAdmin
);

router.get(
  "/audit-logs",
  protect,
  adminOnly,
  getAuditLogs
);


export default router;