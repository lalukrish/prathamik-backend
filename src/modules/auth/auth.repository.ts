import { prisma } from "../../config/db";

export const authRepository = {
    findByEmail: async (email: string) => {
        return prisma.user.findUnique({
            where: { email },
        });
    },

    createSession: async (data: {
        userId: string;
        tokenHash: string;
        ipAddress?: string;
        userAgent?: string;
        device?: string;
        expiresAt: Date;
    }) => {
        return prisma.session.create({
            data,
        });
    },

    deactivateSession: async (tokenHash: string) => {
        return prisma.session.updateMany({
            where: { tokenHash },
            data: { isActive: false },
        });
    },

    findActiveSession: async (tokenHash: string) => {
        return prisma.session.findUnique({
            where: {
                tokenHash,
                isActive: true,
                expiresAt: { gt: new Date() },
            },
        });
    },

};