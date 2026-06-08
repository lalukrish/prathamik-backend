import { SecurityEventType, SecuritySeverity } from "@prisma/client";
import { prisma } from "../../config/db";

const getSeverity = (type: SecurityEventType): SecuritySeverity => {
    switch (type) {
        case "COPY_PASTE":
        case "DEVTOOLS_OPEN":
            return "HIGH";

        case "FULLSCREEN_EXIT":
        case "MULTIPLE_MONITORS":
            return "MEDIUM";

        case "TAB_SWITCH":
        case "WINDOW_BLUR":
        case "WINDOW_MINIMIZE":
            return "LOW";

        default:
            return "LOW";
    }
};
export class PublicRepo {
    async validateInterviewToken(token: string) {
        const interview = await prisma.interview.findUnique({
            where: {
                accessToken: token,
            },
            select: {
                status: true,
                scheduledStartAt: true,
                durationMinutes: true,
            },
        });

        if (!interview) {
            return { status: "INVALID", message: "Invalid token" };
        }

        if (interview.status === "COMPLETED") {
            return { status: "COMPLETED", message: "Interview already completed" };
        }

        if (interview.status === "CANCELLED") {
            return { status: "CANCELLED", message: "Interview cancelled" };
        }

        if (interview.status === "RESCHEDULED") {
            return { status: "RESCHEDULED", message: "Interview rescheduled" };
        }
        if (interview.scheduledStartAt && new Date() < interview.scheduledStartAt) {
            return {
                status: "PENDING",
                message: `Interview will start on ${interview.scheduledStartAt.toLocaleString()}`,
            };
        }
        if (interview.status === "EXPIRED") {
            return { status: "EXPIRED", message: "Interview has expired" };
        }
        if (interview.status === "IN_PROGRESS") {
            return {
                status: "IN_PROGRESS",
                message: "Interview is in progress",
                interview,
            };
        }

        return {
            status: "STARTED",
            message: "Interview is ready to start",
            interview,
        };
    }

    async findInterviewByToken(token: string) {
        return prisma.interview.findUnique({
            where: {
                accessToken: token,
            },
            select: {
                id: true,
                status: true,
                scheduledStartAt: true,
                scheduledEndAt: true,
            },
        });
    }

    async canidateIdByToken(token: string) {
        const interview = await prisma.interview.findUnique({
            where: {
                accessToken: token,
            },
            include: {
                application: {
                    select: {
                        candidateId: true,
                    },
                },
            },
        });

        if (!interview) {
            throw new Error("Invalid token");
        }

        return interview.application.candidateId;
    }

    async cancelInterview(candidateId: string, token: string, reason: string) {
        const interview = await prisma.interview.update({
            where: {
                accessToken: token,
            },
            data: {
                status: "CANCELLED",
                cancelledReason: reason,
                cancelledAt: new Date(),
                cancelledById: candidateId,
                cancelledByType: "CANDIDATE",
            },
            select: {
                id: true,
            },
        });

        await prisma.interviewActivity.create({
            data: {
                interviewId: interview.id,
                action: "CANCELLED",
                metadata: { reason },
                candidateId: candidateId,
                createdAt: new Date(),
            },
        });

        return interview;
    }

    async startInterview(id: string) {
        return prisma.$transaction(async (tx) => {
            const interview = await tx.interview.update({
                where: { id },
                include: {
                    application: {
                        select: {
                            candidateId: true,
                        },
                    },
                },
                data: {
                    status: "IN_PROGRESS",
                    startedAt: new Date(),
                },
            });

            await tx.interviewActivity.create({
                data: {
                    interviewId: id,
                    candidateId: interview.application.candidateId,
                    action: "STARTED",
                },
            });

            return interview;
        });
    }

    async getNextQuestion(interviewId: string) {
        const answeredQuestionIds = await prisma.interviewAnswer.findMany({
            where: {
                interviewId,
            },
            select: {
                questionId: true,
            },
        });
        const question = await prisma.interviewQuestion.findFirst({
            where: {
                interviewId,
                id: {
                    notIn: answeredQuestionIds.map((x) => x.questionId),
                },
            },
            orderBy: {
                order: "asc",
            },

        });
        return question;
    }

    async findInterviewQuestion(interviewId: string, id: string) {
        return prisma.interviewQuestion.findFirst({
            where: {
                interviewId,
                id,
            },
        });
    }

    async findAnswer(interviewId: string, questionId: string) {
        return prisma.interviewAnswer.findFirst({
            where: {
                interviewId,
                questionId,
            },
        });
    }

    async saveAnswer(interviewId: string, questionId: string, answerText: string) {
        return prisma.interviewAnswer.create({
            data: {
                interviewId,
                questionId,
                answerText,
            },
        });
    }

    async createSecurityEvent({
        interviewId,
        type,
        metadata,
    }: {
        interviewId: string;
        type: SecurityEventType;
        metadata?: any;
    }) {
        return prisma.interviewSecurityEvent.create({
            data: {
                interviewId,
                type,
                severity: getSeverity(type),
                metadata,
            },
        });
    };

    async findInterviewById(id: string) {
        return prisma.interview.findUnique({
            where: { id },
            include: {
                questions: true,
                answers: true,
                application: {
                    select: {
                        candidateId: true
                    }
                }
            },
        });
    }

    async getSecuritySummary(interviewId: string) {
        return prisma.interviewSecurityEvent.groupBy({
            by: ["type"],
            where: {
                interviewId,
            },
            _count: true,
        });
    }

    async completeInterview(interviewId: string, suspicionScore: number) {
        return prisma.interview.update({
            where: {
                id: interviewId,
            },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                suspicionScore,
            },
        });
    }

    async interviewActivityCandidate(interviewId: string, candidateId: string) {
        return prisma.interviewActivity.create({
            data: {
                interviewId,
                candidateId,
                action: "COMPLETED",
            },
        });
    }
}
