import { Router } from "express";

import { protect } from "../middleware/auth";
import {
  createApplication,
  getMyApplications,
  getApplicationById
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

export default router;