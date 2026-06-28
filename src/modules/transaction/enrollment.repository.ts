// enrollment.repo.ts
import { prisma } from "../../config/db";

export const enrollmentRepository = {
  async findOne(userId: string, mockTestId: string) {
    return prisma.userTestEnrollment.findUnique({
      where: { userId_mockTestId: { userId, mockTestId } },
    });
  },

  async create(userId: string, mockTestId: string) {
    return prisma.userTestEnrollment.create({
      data: { userId, mockTestId },
    });
  },

  async findByUser(userId: string) {
    return prisma.userTestEnrollment.findMany({
      where: { userId },
      include: {
        mockTest: {
          select: { id: true, title: true, thumbnailUrl: true, category: true },
        },
      },
    });
  },
};
