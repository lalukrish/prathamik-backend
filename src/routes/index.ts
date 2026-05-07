import { Router } from "express";
import jobRoutes from "../modules/jobs/job.routes";
import authRoutes from "../modules/auth/auth.routes";

const router = Router();

router.use("/jobs", jobRoutes);
router.use("/auth", authRoutes);

export default router;