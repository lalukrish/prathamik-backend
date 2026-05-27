import { Worker } from "bullmq";
import { prisma } from "../../config/db";
import { redisConnection } from "../../config/redis";
import { generateQuestionsWithAI } from "./questionBank.ai";
import * as repository from "./questionBank.repository";

new Worker(
    "question-bank-ai",

    async (job) => {
        const {
            questionBankId,
            config,
        } = job.data;

        // ===============================================
        // GET QUESTION BANK
        // ===============================================

        const questionBank =
            await prisma.questionBank.findUnique(
                {
                    where: {
                        id: questionBankId,
                    },

                    include: {
                        job: true,
                    },
                },
            );

        if (!questionBank) {
            throw new Error(
                "Question bank not found",
            );
        }

        // ===============================================
        // GENERATE AI QUESTIONS
        // ===============================================

        const questions =
            await generateQuestionsWithAI(
                {
                    job: questionBank.job,

                    config,
                },
            );

        // ===============================================
        // SAVE QUESTIONS
        // ===============================================

        await repository.bulkCreateQuestions(
            questionBankId,
            questions.map(
                (question: any) => ({
                    ...question,

                    aiGenerated: true,
                }),
            ),
        );

        // ===============================================
        // UPDATE TOTAL
        // ===============================================

        await repository.updateTotalQuestions(
            questionBankId,
        );

        console.log(
            `AI Questions Generated: ${questionBankId}`,
        );
    },

    {
        connection: redisConnection,
    },
);