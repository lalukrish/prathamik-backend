import { Router } from "express";
import jobRoutes from "../modules/jobs/job.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import { JobController } from "../modules/jobs/job.controller";
import publicRoutes from "../modules/public/public.routes";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new JobController();

// private routes
router.use("/jobs", authMiddleware, jobRoutes);
router.use("/auth", authRoutes);
router.use("/user", authMiddleware, userRoutes);

// public routes
router.get("/jobs/:id", controller.getOne.bind(controller));
router.use("/public", publicRoutes);

export default router;
