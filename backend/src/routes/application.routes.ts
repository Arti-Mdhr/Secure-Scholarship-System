import { Router } from "express";

import { protect } from "../middleware/auth";
import {
  createApplication,
  getMyApplications,
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

export default router;