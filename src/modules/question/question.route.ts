import { Router } from "express";
import { questionController } from "./question.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  questionController.createQuestion,
);

router.get(
  "/mock-test/:mockTestId",
  authMiddleware,
  questionController.getQuestionsByMockTest,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  questionController.updateQuestion,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  questionController.deleteQuestion,
);

export default router;
