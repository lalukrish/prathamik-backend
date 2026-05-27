import * as repository from "./questionBank.repository";
import { questionBankQueue } from "./questionBank.queue";


export const createQuestionBank =
    async (
        orgId: string,
        userId: string,
        payload: any,
    ) => {

        const bank =
            await repository.createQuestionBank(
                {
                    orgId,
                    createdBy: userId,
                    title: payload.title,
                    description:
                        payload.description,
                    jobId: payload.jobId,
                    mode: payload.mode,
                    aiGenerated:
                        payload.mode === "AI",
                },
            );

        // AI Genreate

        if (payload.mode === "AI") {
            if (!payload.config) {
                throw new Error(
                    "AI config is required",
                );
            }

            // ADD TO QUEUE
            await questionBankQueue.add(
                "generate-questions",
                {
                    questionBankId: bank.id,
                    config: payload.config,
                },
                {
                    attempts: 3,
                    backoff: {
                        type: "exponential",
                        delay: 5000,
                    },
                    removeOnComplete: 50,
                    removeOnFail: 20,
                },
            );
        }
        return bank;
    };

// =====================================================
// GET ALL QUESTION BANKS
// =====================================================

export const getQuestionBanks =
    async (
        orgId: string,
        page: number = 1,
        limit: number = 10,
        search: string
    ) => {
        return repository.getQuestionBanks(
            orgId,
            page,
            limit,
            search
        );
    };

// =====================================================
// GET SINGLE QUESTION BANK
// =====================================================

export const getQuestionBankById =
    async (
        id: string,
        orgId: string,
    ) => {
        const bank =
            await repository.getQuestionBankById(
                id,
                orgId,
            );

        if (!bank) {
            throw new Error(
                "Question bank not found",
            );
        }

        return bank;
    };

// =====================================================
// UPDATE QUESTION BANK
// =====================================================

export const updateQuestionBank =
    async (
        id: string,
        payload: any,
    ) => {
        return repository.updateQuestionBank(
            id,
            payload,
        );
    };

// =====================================================
// DELETE QUESTION BANK
// =====================================================

export const deleteQuestionBank =
    async (id: string) => {
        return repository.deleteQuestionBank(
            id,
        );
    };

// =====================================================
// BULK CREATE QUESTIONS
// =====================================================

export const bulkCreateQuestions =
    async (
        questionBankId: string,
        payload: any,
    ) => {
        // ===============================================
        // INSERT QUESTIONS
        // ===============================================

        await repository.bulkCreateQuestions(
            questionBankId,
            payload.questions,
        );

        // ===============================================
        // UPDATE TOTAL
        // ===============================================

        await repository.updateTotalQuestions(
            questionBankId,
        );

        return {
            success: true,

            message:
                "Questions added successfully",
        };
    };

// =====================================================
// UPDATE QUESTION
// =====================================================

export const updateQuestion =
    async (
        questionId: string,
        payload: any,
    ) => {
        return repository.updateQuestion(
            questionId,
            payload,
        );
    };

// =====================================================
// DELETE QUESTION
// =====================================================

export const deleteQuestion =
    async (questionId: string) => {
        return repository.deleteQuestion(
            questionId,
        );
    };