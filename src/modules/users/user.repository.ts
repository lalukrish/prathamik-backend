import { prisma } from "../../config/db";

export const userRepository = {
  findByUserId: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },
  createUser: async (data: any) => {
    return prisma.user.create({ data });
  },
};
