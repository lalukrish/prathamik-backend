import { prisma } from "../../config/db";

export const candidateRepository = {
  findByUserId: async (id: string) => {
    return prisma.candidate.findUnique({ where: { id } });
  },
  findByEmail: async (email: string) => {
    return prisma.candidate.findUnique({
      where: { email },
    });
  },
  findAllCandidate: async (skip: number, limit: number) => {
    return prisma.candidate.findMany({
      skip,
      take: limit,
    });
  },

  count: async (isActive?: boolean) => {
    return prisma.candidate.count({});
  },
};
