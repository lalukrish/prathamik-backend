import { Router } from "express";
import jobRoutes from "../modules/jobs/job.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import { JobController } from "../modules/jobs/job.controller";

const router = Router();
const controller = new JobController();

// private routes
router.use("/jobs", jobRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);

// public routes
router.get("/jobs/:id", controller.getOne.bind(controller));

export default router;
