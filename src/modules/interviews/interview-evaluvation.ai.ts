
import { prisma } from "../../config/db"
import { evaluateWithAI } from "../ai/interview-evaluation.service";
export const evaluateInterview =
    async (
        interviewId: string
    ) => {
        const interview =
            await prisma.interview.findUnique({
                where: {
                    id: interviewId,
                },
                include: {
                    application: {
                        include: {
                            job: true,
                        },
                    },
                    answers: {
                        include: {
                            question: true,
                        },
                    },
                },
            });

        if (!interview) {
            throw new Error(
                "Interview not found"
            );
        }

        const qaPairs =
            interview.answers.map(
                (answer) => ({
                    answerId: answer.id,
                    question:
                        answer.question
                            .question,
                    answer:
                        answer.answerText,
                    maxScore: answer.question.maxScore,
                })
            );

        const evaluation =
            await evaluateWithAI({
                jobTitle:
                    interview.application.job
                        .title,
                jobDescription:
                    interview.application.job
                        .description,
                qaPairs,
            });

        await prisma.candidateScore.update({
            where: {
                applicationId: interview.applicationId,
            },
            data: {
                technicalScore:
                    evaluation.technicalScore,
                communicationScore:
                    evaluation.communicationScore,
                problemSolvingScore:
                    evaluation.problemSolvingScore,
                overallScore:
                    evaluation.overallScore,
                aiFeedback:
                    evaluation.feedback,
                interviewScore: evaluation.overallScore,
            },
        });

        await Promise.all(
            evaluation.questions.map((q: any) =>
                prisma.interviewAnswer.update({
                    where: {
                        id: q.answerId,
                    },
                    data: {
                        score: q.score,
                    },
                })
            )
        );

        await prisma.application.update({
            where: {
                id:
                    interview.applicationId,
            },
            data: {
                overallScore: evaluation.overallScore,
            },
        });
    };

