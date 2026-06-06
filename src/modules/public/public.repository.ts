import { prisma } from "../../config/db";

export class PublicRepo {
    async validateInterviewToken(token: string) {
        const interview = await prisma.interview.findUnique({
            where: {
                token,
            },
        });

        if (!interview) {
            throw new Error("Invalid token");
        }

        if (interview.status === "COMPLETED") {
            throw new Error("Interview already completed");
        }

        if (interview.status === "CANCELLED") {
            throw new Error("Interview cancelled");
        }

        if (interview.status === "RESCHEDULED") {
            throw new Error("Interview rescheduled");
        }

        if (interview.scheduledAt && new Date() < new Date(interview.scheduledAt)) {
            throw new Error(`Interview will start on ${new Date(interview.scheduledAt).toLocaleString()}`);
        }

        return interview;
    }

}