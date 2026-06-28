import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { dashboardController } from "./dashboard.controller";

const router = Router();

// All routes require auth
router.use(authMiddleware);

router.get("/stats", dashboardController.getOverallStats);
router.get("/tests", dashboardController.getAttendedTests);
router.get("/tests/:sessionId", dashboardController.getTestResult);
router.get("/in-progress", dashboardController.getInProgressTests);

export default router;
