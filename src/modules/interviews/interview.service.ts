import crypto from "crypto";

import {
    findApplicationById,
    findQuestionBankById,
    createInterview,
    createInterviewQuestions,
    updateApplicationStatus,
    findInterviewByToken,
} from "./interview.repository";

export const scheduleInterview = async ({
    applicationId,
    questionBankId,
    scheduledStartAt,
    userId,
}: {
    applicationId: string;
    questionBankId: string;
    scheduledStartAt: string | Date;
    userId: string;
}) => {
    // ==========================================
    // Validate Application
    // ==========================================

    const application =
        await findApplicationById(applicationId);

    if (!application) {
        throw new Error("Application not found");
    }

    if (application.interview) {
        throw new Error(
            "Interview already scheduled"
        );
    }

    // ==========================================
    // Validate Template
    // ==========================================

    const template =
        await findQuestionBankById(questionBankId);

    if (!template) {
        throw new Error(
            "Interview template not found"
        );
    }

    if (
        !template.questions ||
        template.questions.length === 0
    ) {
        throw new Error(
            "Interview template has no questions"
        );
    }

    // ==========================================
    // Validate Schedule Date
    // ==========================================

    const startDate = new Date(
        scheduledStartAt
    );

    if (isNaN(startDate.getTime())) {
        throw new Error(
            "Invalid scheduled start date"
        );
    }

    // ==========================================
    // Calculate Duration
    // ==========================================

    const totalSeconds =
        template.questions.reduce(
            (total, question) =>
                total +
                (question.timeLimitSeconds || 0),
            0
        );

    const durationMinutes =
        Math.ceil(totalSeconds / 60);

    const endDate = new Date(
        startDate.getTime() +
        totalSeconds * 1000
    );

    // ==========================================
    // Generate Access Token
    // ==========================================

    const accessToken =
        crypto.randomUUID();

    // ==========================================
    // Create Interview
    // ==========================================

    const interview =
        await createInterview({
            applicationId,
            questionBankId,
            accessToken,

            totalQuestions:
                template.questions.length,

            durationMinutes,

            scheduledStartAt: startDate,
            scheduledEndAt: endDate,

            expiresAt: endDate,

            createdBy: userId,

            invitedAt: new Date(),
        });

    // ==========================================
    // Create Interview Questions Snapshot
    // ==========================================

    const questions =
        template.questions.map(
            (question, index) => ({
                interviewId: interview.id,

                questionId: question.id,

                question: question.question,

                type: question.type,

                difficulty:
                    question.difficulty,

                skillTags:
                    question.skillTags || [],

                options:
                    question.options,

                audioUrl:
                    question.audioUrl,

                aiGenerated:
                    question.aiGenerated,

                order: index + 1,

                maxScore:
                    question.weight,

                timeLimitSeconds:
                    question.timeLimitSeconds,
            })
        );

    await createInterviewQuestions(
        questions
    );

    // ==========================================
    // Update Application Status
    // ==========================================

    await updateApplicationStatus(
        applicationId
    );

    return interview;
};

export const getInterviewByToken =
    async (token: string) => {
        const interview =
            await findInterviewByToken(
                token
            );

        if (!interview) {
            throw new Error(
                "Interview not found"
            );
        }

        const now = new Date();

        // ==========================================
        // Already Submitted
        // ==========================================

        if (interview.isSubmitted) {
            return {
                canStart: false,
                status: "COMPLETED",
                message:
                    "Interview already submitted",
            };
        }

        // ==========================================
        // Before Schedule Time
        // ==========================================

        if (
            interview.scheduledStartAt &&
            now <
            interview.scheduledStartAt
        ) {
            return {
                canStart: false,
                status: "WAITING",
                scheduledStartAt:
                    interview.scheduledStartAt,
                message:
                    "Interview has not started yet",
            };
        }

        // ==========================================
        // Expired
        // ==========================================

        if (
            interview.expiresAt &&
            now > interview.expiresAt
        ) {
            return {
                canStart: false,
                status: "EXPIRED",
                expiresAt:
                    interview.expiresAt,
                message:
                    "Interview link expired",
            };
        }

        // ==========================================
        // Ready
        // ==========================================

        return {
            canStart: true,
            status: "READY",

            interview: {
                id: interview.id,

                title:
                    interview.title ||
                    interview.application.job
                        .title,

                totalQuestions:
                    interview.totalQuestions,

                durationMinutes:
                    interview.durationMinutes,

                scheduledStartAt:
                    interview.scheduledStartAt,

                scheduledEndAt:
                    interview.scheduledEndAt,
            },

            candidate: {
                id:
                    interview.application
                        .candidate.id,

                name:
                    interview.application
                        .candidate.name,
            },

            job: {
                id:
                    interview.application
                        .job.id,

                title:
                    interview.application
                        .job.title,
            },
        };
    };