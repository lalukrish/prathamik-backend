import { prisma } from "../../config/db";

// =====================================================
// CREATE BANK
// =====================================================

export const createQuestionBank =
    async (data: any) => {
        return prisma.questionBank.create({
            data,
        });
    };

// =====================================================
// GET ALL
// =====================================================

export const getQuestionBanks =
    async (orgId: string) => {
        return prisma.questionBank.findMany({
            where: {
                orgId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    };

// =====================================================
// GET SINGLE
// =====================================================

export const getQuestionBankById =
    async (
        id: string,
        orgId: string,
    ) => {
        return prisma.questionBank.findFirst(
            {
                where: {
                    id,
                    orgId,
                },

                include: {
                    questions: true,
                },
            },
        );
    };

// =====================================================
// UPDATE BANK
// =====================================================

export const updateQuestionBank =
    async (
        id: string,
        data: any,
    ) => {
        return prisma.questionBank.update({
            where: {
                id,
            },

            data,
        });
    };

// =====================================================
// DELETE BANK
// =====================================================

export const deleteQuestionBank =
    async (id: string) => {
        return prisma.questionBank.delete({
            where: {
                id,
            },
        });
    };

// =====================================================
// BULK QUESTIONS
// =====================================================

export const bulkCreateQuestions =
    async (
        questionBankId: string,
        questions: any[],
    ) => {
        return prisma.question.createMany({
            data: questions.map(
                (question) => ({
                    questionBankId,

                    question:
                        question.question,

                    type: question.type,

                    difficulty:
                        question.difficulty,

                    weight:
                        question.weight ||
                        10,

                    skillTags:
                        question.skillTags,

                    options:
                        question.options,

                    audioUrl:
                        question.audioUrl,

                    aiGenerated:
                        question.aiGenerated ||
                        false,
                }),
            ),
        });
    };

// =====================================================
// UPDATE QUESTION
// =====================================================

export const updateQuestion =
    async (
        id: string,
        data: any,
    ) => {
        return prisma.question.update({
            where: {
                id,
            },

            data,
        });
    };

// =====================================================
// DELETE QUESTION
// =====================================================

export const deleteQuestion =
    async (id: string) => {
        return prisma.question.delete({
            where: {
                id,
            },
        });
    };

// =====================================================
// UPDATE TOTAL
// =====================================================

export const updateTotalQuestions =
    async (
        questionBankId: string,
    ) => {
        const total =
            await prisma.question.count({
                where: {
                    questionBankId,
                },
            });

        return prisma.questionBank.update({
            where: {
                id: questionBankId,
            },

            data: {
                totalQuestions: total,
            },
        });
    };