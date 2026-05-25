import { Router } from "express";
import jobRoutes from "../modules/jobs/job.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import { JobController } from "../modules/jobs/job.controller";
import publicRoutes from "../modules/public/public.routes";
import candidateRoutes from "../modules/candidates/candidate.routes";
import { authMiddleware } from "../middlewares/auth.middleware";
import AdminRoutes from "../modules/admin/admin.routes";
const router = Router();
const controller = new JobController();

// private routes
router.use("/jobs", authMiddleware, jobRoutes);
router.use("/auth", authRoutes);
router.use("/user", authMiddleware, userRoutes);
router.use("/candidate", authMiddleware, candidateRoutes);
router.use("/admin", authMiddleware, AdminRoutes);

// public routes

router.get("/jobs/:id", controller.getOne.bind(controller));
router.use("/public", publicRoutes);

export default router;
