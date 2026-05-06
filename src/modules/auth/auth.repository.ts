import { prisma } from "../../config/db";

export const getUserById = async (userId: string) => {
    // Implement this function to fetch user from DB
    // Example using Prisma:
    return prisma.user.findUnique({ where: { id: userId } });

};