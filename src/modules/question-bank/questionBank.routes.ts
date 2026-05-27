import { Router } from "express";

import * as controller from "./questionBank.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

import { validate } from "../../middlewares/validation.middleware";

import {
    bulkQuestionSchema,
    createQuestionBankSchema,
    updateQuestionBankSchema,
    updateQuestionSchema,
} from "./questionBank.validator";

const router = Router();

// =====================================================
// CREATE QUESTION BANK
// =====================================================

router.post(
    "/",
    authMiddleware,
    validate(createQuestionBankSchema),
    controller.createQuestionBank,
);

// =====================================================
// GET ALL QUESTION BANKS
// =====================================================

router.get(
    "/",
    authMiddleware,
    controller.getQuestionBanks,
);

// =====================================================
// GET SINGLE QUESTION BANK
// =====================================================

router.get(
    "/:id",
    authMiddleware,
    controller.getQuestionBankById,
);

// =====================================================
// UPDATE QUESTION BANK
// =====================================================

router.patch(
    "/:id",
    authMiddleware,
    validate(
        updateQuestionBankSchema,
    ),
    controller.updateQuestionBank,
);

// =====================================================
// DELETE QUESTION BANK
// =====================================================

router.delete(
    "/:id",
    authMiddleware,
    controller.deleteQuestionBank,
);

// =====================================================
// BULK CREATE QUESTIONS
// =====================================================

router.post(
    "/:id/questions/bulk",
    authMiddleware,
    validate(bulkQuestionSchema),
    controller.bulkCreateQuestions,
);

// =====================================================
// UPDATE QUESTION
// =====================================================

router.patch(
    "/:id/questions/:questionId",
    authMiddleware,
    validate(updateQuestionSchema),
    controller.updateQuestion,
);

// =====================================================
// DELETE QUESTION
// =====================================================

router.delete(
    "/:id/questions/:questionId",
    authMiddleware,
    controller.deleteQuestion,
);

export default router;