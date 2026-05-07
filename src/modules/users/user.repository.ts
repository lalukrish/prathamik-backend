import { prisma } from "../../config/db";

export const userRepository = {
  findByUserId: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  createUser: async (data: any) => {
    return prisma.user.create({ data });
  },
  updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
  updateUserInActive(id: string, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: {
        isActive,
      },
    });
  },
  findAllUser: async () => {
    return prisma.user.findMany({
      where: {
        isActive: true,
      },
    });
  },
};
