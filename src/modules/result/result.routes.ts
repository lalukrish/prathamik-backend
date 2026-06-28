import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { testSessionController } from "./result.controller";

const router = Router();

// ── Specific routes FIRST (before /:sessionId wildcard) ──────────
router.get("/tests", testSessionController.getAvailableTests);

router.post(
  "/start/:mockTestId",
  authMiddleware,
  testSessionController.startTest,
);

// These must come before /:sessionId or Express will never reach them
router.patch(
  "/pause/:sessionId",
  authMiddleware,
  testSessionController.pauseTest,
);
router.patch(
  "/resume/:sessionId",
  authMiddleware,
  testSessionController.resumeTest,
);

// Result must also come before the bare /:sessionId wildcard
router.get(
  "/result/:sessionId",
  authMiddleware,
  testSessionController.getResult,
);

// ── Wildcard session routes ───────────────────────────────────────
router.get("/:sessionId", authMiddleware, testSessionController.getSession);
router.post(
  "/:sessionId/answer",
  authMiddleware,
  testSessionController.submitAnswer,
);
router.post(
  "/:sessionId/submit",
  authMiddleware,
  testSessionController.submitTest,
);

export default router;
