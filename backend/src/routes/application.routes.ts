import { Router } from "express";

import { protect } from "../middleware/auth";
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  updateApplication
} from "../controllers/application.controller";

const router = Router();

router.post(
  "/",
  protect,
  createApplication
);

router.get(
  "/",
  protect,
  getMyApplications
);

router.get(
  "/:id",
  protect,
  getApplicationById
);

router.put(
  "/:id",
  protect,
  updateApplication
);

export default router;