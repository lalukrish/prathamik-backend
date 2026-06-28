

import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { testSessionController } from "./test-session.controller";

const router = Router();

// ── Specific routes FIRST (before /:sessionId wildcard) ──────────
router.get("/tests", testSessionController.getAvailableTests);

router.post(
  "/start/:mockTestId",
  authMiddleware,
  testSessionController.startTest,
);

// These must come before /:sessionId or Express will never reach them
router.patch("/pause/:sessionId", testSessionController.pauseTest);
router.patch("/resume/:sessionId", testSessionController.resumeTest);

// ── Wildcard session routes ───────────────────────────────────────
router.get("/:sessionId", testSessionController.getSession);
router.post("/:sessionId/answer", testSessionController.submitAnswer);
router.post("/:sessionId/submit", testSessionController.submitTest);

export default router;
