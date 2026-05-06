import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export const userRepository = {
  findByEmail: async (email: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { email } });
  },
};
