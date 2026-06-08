import { InterviewActivity } from './../../../node_modules/.prisma/client/index.d';
import { includes } from "zod";
import { prisma } from "../../config/db";
import { InterviewAction, InterviewStatus } from "@prisma/client";

export const findApplicationById = async (applicationId: string) => {
    return prisma.application.findUnique({
        where: {
            id: applicationId,
        },
        include: {
            candidate: true,
            job: true,
            interviews: {
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });
};

export const findInterviewByIdRaw = async (interviewId: string) => {
    return prisma.interview.findUnique({
        where: {
            id: interviewId,
        },

        include: {
            questions: {
                orderBy: {
                    order: "asc",
                },
            },
        },
    });
};

export const createActivity = async (data: {
    interviewId: string;
    action: InterviewAction;
    userId?: string;
    candidateId?: string;
    metadata?: any;
}) => {
    return prisma.interviewActivity.create({
        data: {
            interviewId: data.interviewId,
            action: data.action,
            userId: data.userId,
            candidateId: data.candidateId,
            metadata: data.metadata,
        },
    });
};


export const findQuestionBankById = async (questionBankId: string) => {
    return prisma.questionBank.findUnique({
        where: {
            id: questionBankId,
        },
        include: {
            questions: true,
        },
    });
};

export const createInterview = async (data: any) => {
    return prisma.interview.create({
        data,
    });
};

export const createInterviewQuestions = async (questions: any[]) => {
    return prisma.interviewQuestion.createMany({
        data: questions,
    });
};

export const updateApplicationStatus = async (applicationId: string) => {
    return prisma.application.update({
        where: {
            id: applicationId,
        },
        data: {
            status: "INTERVIEW",
        },
    });
};

export const findInterviews = async ({
    orgId,
    status,
    page,
    limit,
}: {
    orgId?: string;
    status?: string;
    page: number;
    limit: number;
}) => {
    return prisma.interview.findMany({
        where: {
            ...(status && {
                status: status as InterviewStatus,
            }),

            ...(orgId && {
                application: {
                    job: {
                        orgId,
                    },
                },
            }),
        },

        include: {
            questionBank: true,

            application: {
                include: {
                    candidate: true,
                    job: true,
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },

        skip: (page - 1) * limit,
        take: limit,
    });
};

export const countInterviews = async ({
    orgId,
    status,
}: {
    orgId?: string;
    status?: string;
}) => {
    return prisma.interview.count({
        where: {
            ...(status && {
                status: status as InterviewStatus,
            }),

            ...(orgId && {
                application: {
                    job: {
                        orgId,
                    },
                },
            }),
        },
    });
};

export const findInterviewById = async (id: string, orgId: string) => {
    return prisma.interview.findFirst({
        where: {
            id,
            application: {
                job: {
                    orgId,
                },
            },
        },

        include: {
            questionBank: true,

            application: {
                include: {
                    candidate: true,
                    job: true,
                },
            },

            questions: {
                orderBy: {
                    order: "asc",
                },
            },
        },
    });
};

export const findInterviewByToken = async (token: string) => {
    return prisma.interview.findUnique({
        where: {
            accessToken: token,
        },

        include: {
            application: {
                include: {
                    candidate: true,
                    job: true,
                },
            },

            questions: {
                orderBy: {
                    order: "asc",
                },
            },
        },
    });
};

export const cancelInterview = async (interviewId: string, data: any) => {
    const interview = await prisma.interview.findUnique({
        where: {
            id: interviewId,
        },
    });

    if (!interview) {
        throw new Error("Interview not found");
    }

    if (interview.status === "CANCELLED") {
        return interview;
    }

    return prisma.interview.update({
        where: {
            id: interviewId,
        },
        data: {
            status: "CANCELLED",
            ...data,
        },
    });
};


export const findExpiredInterviews =
    async () => {
        return prisma.interview.findMany({
            where: {
                status: {
                    in: [
                        "SCHEDULED",
                        "IN_PROGRESS",
                    ],
                },

                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    };

export const expireInterview =
    async (id: string) => {
        return prisma.interview.update({
            where: {
                id,
            },
            data: {
                status: "EXPIRED",
                submittedBySystem: true,
            },
        });
    };

export const findInterviewsByApplicationId = async (applicationId: string, orgId: string) => {
    return prisma.interview.findMany({
        where: {
            applicationId,
            application: {
                job: {
                    orgId,
                },
            },
        },
        select: {
            id: true,
            scheduledStartAt: true,
            activities: {
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                    candidate: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
        },

        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findInterviewActivitiesByInterviewIds = async (interviewIds: string[]) => {
    return prisma.interviewActivity.findMany({
        where: {
            interviewId: {
                in: interviewIds,
            },
        },
        include: {
            user: {
                select: {
                    name: true,
                },
            },
            candidate: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

