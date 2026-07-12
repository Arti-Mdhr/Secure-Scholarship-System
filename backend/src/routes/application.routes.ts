import { Router } from "express";

import { protect } from "../middleware/auth";
import { createApplication } from "../controllers/application.controller";

const router = Router();

router.post(
  "/",
  protect,
  createApplication
);

export default router;