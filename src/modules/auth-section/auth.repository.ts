import { prisma } from "../../config/db";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async createUser(data: any) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findSessionById(sessionId: string) {
    return prisma.authSession.findUnique({
      where: {
        id: sessionId,
      },
    });
  }

  async createSession(data: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.authSession.create({
      data,
    });
  }

  async deleteSession(sessionId: string) {
    return prisma.authSession.delete({
      where: {
        id: sessionId,
      },
    });
  }

  async getAllMockTests() {
    return prisma.mockTest.findMany({
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
  }
  async getQuestionsByMockTest(mockTestId: string) {
    return prisma.question.findMany({
      where: {
        mockTestId,
      },
      include: {
        options: true,
      },
    });
  }
}

export const authRepository = new AuthRepository();
