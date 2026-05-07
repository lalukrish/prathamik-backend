import { Router } from "express";
import jobRoutes from "../modules/jobs/job.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";

const router = Router();

router.use("/jobs", jobRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
export default router;
