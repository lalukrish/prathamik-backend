import crypto from "crypto";

import {
    findApplicationById,
    findQuestionBankById,
    createInterview,
    createInterviewQuestions,
    updateApplicationStatus,
    findInterviewByToken,
    createActivity,
    findInterviewByIdRaw,
    cancelInterview,
    findScheduleInterviewHistory,
    findInterviewsByApplicationId,
    findInterviewActivitiesByInterviewIds,
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

    const application = await findApplicationById(applicationId);

    if (!application) {
        throw new Error("Application not found");
    }

    const activeInterview = application.interviews?.find(
        (i) =>
            i.status === "PENDING" ||
            i.status === "SCHEDULED" ||
            i.status === "IN_PROGRESS",
    );

    if (activeInterview) {
        throw new Error("Active interview already exists");
    }

    // ==========================================
    // Validate Template
    // ==========================================

    const template = await findQuestionBankById(questionBankId);

    if (!template) {
        throw new Error("Interview template not found");
    }

    if (!template.questions || template.questions.length === 0) {
        throw new Error("Interview template has no questions");
    }

    // ==========================================
    // Validate Schedule Date
    // ==========================================

    const startDate = new Date(scheduledStartAt);

    if (isNaN(startDate.getTime())) {
        throw new Error("Invalid scheduled start date");
    }

    // ==========================================
    // Calculate Duration
    // ==========================================

    const totalSeconds = template.questions.reduce(
        (total, question) => total + (question.timeLimitSeconds || 0),
        0,
    );

    const durationMinutes = Math.ceil(totalSeconds / 60);

    const endDate = new Date(startDate.getTime() + totalSeconds * 1000);

    // ==========================================
    // Generate Access Token
    // ==========================================

    const accessToken = crypto.randomUUID();

    // ==========================================
    // Create Interview
    // ==========================================

    const interview = await createInterview({
        status: "SCHEDULED",
        applicationId,
        questionBankId,
        accessToken,
        totalQuestions: template.questions.length,
        durationMinutes,
        scheduledStartAt: startDate,
        scheduledEndAt: endDate,
        expiresAt: endDate,
        createdById: userId,
        invitedAt: new Date(),
    });

    await createActivity({
        interviewId: interview.id,
        action: "SCHEDULED",
        userId,
    });

    // ==========================================
    // Create Interview Questions Snapshot
    // ==========================================

    const questions = template.questions.map((question, index) => ({
        interviewId: interview.id,

        questionId: question.id,

        question: question.question,

        type: question.type,

        difficulty: question.difficulty,

        skillTags: question.skillTags || [],

        options: question.options,

        audioUrl: question.audioUrl,

        aiGenerated: question.aiGenerated,

        order: index + 1,

        maxScore: question.weight,

        timeLimitSeconds: question.timeLimitSeconds,
    }));

    await createInterviewQuestions(questions);

    // ==========================================
    // Update Application Status
    // ==========================================

    await updateApplicationStatus(applicationId);

    return interview;
};

export const getInterviewByToken = async (token: string) => {
    const interview = await findInterviewByToken(token);

    if (!interview) {
        throw new Error("Interview not found");
    }

    const now = new Date();

    // ==========================================
    // Already Submitted
    // ==========================================

    if (interview.isSubmitted) {
        return {
            canStart: false,
            status: "COMPLETED",
            message: "Interview already submitted",
        };
    }

    // ==========================================
    // Before Schedule Time
    // ==========================================

    if (interview.scheduledStartAt && now < interview.scheduledStartAt) {
        return {
            canStart: false,
            status: "WAITING",
            scheduledStartAt: interview.scheduledStartAt,
            message: "Interview has not started yet",
        };
    }

    // ==========================================
    // Expired
    // ==========================================

    if (interview.expiresAt && now > interview.expiresAt) {
        return {
            canStart: false,
            status: "EXPIRED",
            expiresAt: interview.expiresAt,
            message: "Interview link expired",
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

            title: interview.title || interview.application.job.title,

            totalQuestions: interview.totalQuestions,

            durationMinutes: interview.durationMinutes,

            scheduledStartAt: interview.scheduledStartAt,

            scheduledEndAt: interview.scheduledEndAt,
        },

        candidate: {
            id: interview.application.candidate.id,

            name: interview.application.candidate.name,
        },

        job: {
            id: interview.application.job.id,

            title: interview.application.job.title,
        },
    };
};

export const rescheduleInterview = async ({
    interviewId,
    scheduledStartAt,
    userId,
    reason,
}: {
    interviewId: string;
    scheduledStartAt: string | Date;
    userId: string;
    reason?: string;
}) => {
    // ==========================================
    // Validate Existing Interview
    // ==========================================

    const oldInterview = await findInterviewByIdRaw(interviewId);

    if (!oldInterview) {
        throw new Error("Interview not found");
    }

    // ==========================================
    // Calculate New Dates
    // ==========================================

    const startDate = new Date(scheduledStartAt);

    if (isNaN(startDate.getTime())) {
        throw new Error("Invalid schedule date");
    }

    const durationMinutes = oldInterview.durationMinutes || 60;

    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    // ==========================================
    // Cancel Old Interview
    // ==========================================

    await cancelInterview(oldInterview.id, {
        cancelledAt: new Date(),
        cancelledById: userId,
        cancelledByType: "RECRUITER",
        cancelledReason: reason,
    });

    await createActivity({
        interviewId: oldInterview.id,
        action: "CANCELLED",
        userId,
        metadata: {
            reason,
        },
    });

    // ==========================================
    // Create New Interview
    // ==========================================

    const newInterview = await createInterview({
        applicationId: oldInterview.applicationId,

        questionBankId: oldInterview.questionBankId,

        title: oldInterview.title,

        status: "SCHEDULED",

        accessToken: crypto.randomUUID(),

        totalQuestions: oldInterview.totalQuestions,

        durationMinutes,

        scheduledStartAt: startDate,

        scheduledEndAt: endDate,

        expiresAt: endDate,

        invitedAt: new Date(),

        createdById: userId,

        rescheduledFromId: oldInterview.id,
    });

    // ==========================================
    // Copy Questions
    // ==========================================

    if (oldInterview.questions.length > 0) {
        await createInterviewQuestions(
            oldInterview.questions.map((question) => ({
                interviewId: newInterview.id,

                questionId: question.questionId,

                question: question.question,

                type: question.type,

                difficulty: question.difficulty,

                skillTags: question.skillTags,

                options: question.options,

                correctAnswer: question.correctAnswer,

                audioUrl: question.audioUrl,

                aiGenerated: question.aiGenerated,

                order: question.order,

                maxScore: question.maxScore,

                timeLimitSeconds: question.timeLimitSeconds,
            })),
        );
    }

    // ==========================================
    // Activity Log
    // ==========================================

    await createActivity({
        interviewId: newInterview.id,
        action: "RESCHEDULED",
        userId,
        metadata: {
            previousInterviewId: oldInterview.id,
        },
    });

    return newInterview;
};

export const cancelInterviewService = async ({
    interviewId,
    userId,
    reason,
}: {
    interviewId: string;
    userId: string;
    reason?: string;
}) => {
    const interview = await findInterviewByIdRaw(interviewId);

    if (!interview) {
        throw new Error("Interview not found");
    }

    if (interview.status === "COMPLETED") {
        throw new Error("Completed interview cannot be cancelled");
    }

    if (interview.status === "CANCELLED") {
        throw new Error("Interview already cancelled");
    }

    const result = await cancelInterview(interviewId, {
        cancelledAt: new Date(),

        cancelledById: userId,

        cancelledByType: "RECRUITER",

        cancelledReason: reason,
    });

    await createActivity({
        interviewId,
        action: "CANCELLED",
        userId,
        metadata: {
            reason,
        },
    });

    return result;
}


export const getScheduleHistory = async (applicationId: string, orgId: string) => {
    const interviews = await findInterviewsByApplicationId(applicationId, orgId);
    // const interviewIds = interviews.map(i => i.id);
    // const interviewActivities = await findInterviewActivitiesByInterviewIds(interviewIds);
    return interviews;
};

