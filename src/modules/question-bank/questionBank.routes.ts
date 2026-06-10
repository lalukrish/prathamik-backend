import { Router } from "express";
import * as controller from "./questionBank.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { bulkQuestionSchema, createQuestionBankSchema, updateQuestionBankSchema, updateQuestionSchema, } from "./questionBank.validator";

const router = Router();

router.post("/", authMiddleware,
    //  validate(createQuestionBankSchema), 
    controller.createQuestionBank);
router.get("/", authMiddleware, controller.getQuestionBanks,);
router.get("/:id", authMiddleware, controller.getQuestionBankById,);
router.patch("/:id", authMiddleware, validate(updateQuestionBankSchema), controller.updateQuestionBank,);
router.delete("/:id", authMiddleware, controller.deleteQuestionBank,);
router.post("/:id/questions/bulk", authMiddleware, validate(bulkQuestionSchema), controller.bulkCreateQuestions,);
router.patch("/:id/questions/:questionId", authMiddleware, validate(updateQuestionSchema), controller.updateQuestion,);
router.delete("/:id/questions/:questionId", authMiddleware, controller.deleteQuestion,);
router.get("/questions-by-job-id/:jobId", authMiddleware, controller.getQuestionBankByJobId,);

export default router;