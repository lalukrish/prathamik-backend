import { prisma } from "../../config/db";
import { InterviewStatus } from "@prisma/client";

export const findApplicationById = async (
    applicationId: string
) => {
    return prisma.application.findUnique({
        where: {
            id: applicationId,
        },
        include: {
            candidate: true,
            job: true,
            interview: true,
        },
    });
};

export const findQuestionBankById =
    async (questionBankId: string) => {
        return prisma.questionBank.findUnique({
            where: {
                id: questionBankId,
            },
            include: {
                questions: true,
            },
        });
    };

export const createInterview = async (
    data: any
) => {
    return prisma.interview.create({
        data,
    });
};

export const createInterviewQuestions = async (
    questions: any[]
) => {
    return prisma.interviewQuestion.createMany({
        data: questions,
    });
};

export const updateApplicationStatus = async (
    applicationId: string
) => {
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

export const findInterviewById = async (
    id: string,
    orgId: string
) => {
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

export const findInterviewByToken =
    async (token: string) => {
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