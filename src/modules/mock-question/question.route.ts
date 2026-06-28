import { Router } from "express";
import { questionController } from "./question.controller";
import {
  authMiddleware,
  roleMiddleware,
} from "../../middlewares/auth.middleware";
// import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  //   roleMiddleware("ADMIN"),
  // upload.single("thumbnail"),
  questionController.createQuestion,
);

router.get(
  "/mock-test/:mockTestId",
  authMiddleware,
  questionController.getQuestions,
);

router.delete(
  "/:id",
  authMiddleware,
  //   roleMiddleware("ADMIN"),
  questionController.deleteQuestion,
);

export default router;
