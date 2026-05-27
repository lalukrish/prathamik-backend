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
    async (
        orgId: string,
        page: number = 1,
        limit: number = 10,
        search?: string,
    ) => {
        const skip = (page - 1) * limit;
        const where = {
            orgId,
            ...(search && {
                name: {
                    contains: search,
                    mode: "insensitive" as const,
                },
            }),
        };

        const [data, total, totalWithoutFilter] = await Promise.all([
            prisma.questionBank.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),
            prisma.questionBank.count({
                where,
            }),
            prisma.questionBank.count({
                where: { orgId },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            totalPages,
            page,
            limit,
        };
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