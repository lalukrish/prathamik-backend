import { prisma } from "../../config/db";

export const authRepository = {
    findByEmail: async (email: string) => {
        return prisma.user.findUnique({
            where: { email },
        });
    },

};