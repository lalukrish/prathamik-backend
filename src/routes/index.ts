import { Router } from "express";
import jobRoutes from "../modules/jobs/job.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import publicRoutes from "../modules/public/public.routes";
import candidateRoutes from "../modules/candidates/candidate.routes";
import { authMiddleware } from "../middlewares/auth.middleware";
import AdminRoutes from "../modules/admin/admin.routes";
import questionBankRoutes from "../modules/question-bank/questionBank.routes";

const router = Router();

// private routes
router.use("/jobs", authMiddleware, jobRoutes);
router.use("/auth", authRoutes);
router.use("/user", authMiddleware, userRoutes);
router.use("/candidate", authMiddleware, candidateRoutes);
router.use("/admin", authMiddleware, AdminRoutes);
router.use("/question-bank", questionBankRoutes);

// public routes
router.use("/public", publicRoutes);

export default router;
