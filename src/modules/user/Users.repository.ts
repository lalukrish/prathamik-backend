import { prisma } from "../../config/db";
import { UserStatus } from "@prisma/client";

export class UsersRepository {
  // All users with aggregated test stats
  async getAllUsers(filters: {
    search?: string;
    status?: UserStatus;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, role, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          // Count of all test sessions
          testSessions: {
            select: {
              id: true,
              status: true,
              score: true,
              submittedAt: true,
              startedAt: true,
              mockTest: {
                select: { id: true, title: true, totalMarks: true },
              },
            },
          },
          // Count of submitted attempts
          attempts: {
            select: {
              id: true,
              score: true,
              totalMarks: true,
              submittedAt: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  // Single user full detail
  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        testSessions: {
          orderBy: { startedAt: "desc" },
          select: {
            id: true,
            status: true,
            score: true,
            remainingSeconds: true,
            startedAt: true,
            submittedAt: true,
            expiresAt: true,
            mockTest: {
              select: {
                id: true,
                title: true,
                totalMarks: true,
                durationMinutes: true,
                questions: { select: { id: true } },
              },
            },
            answers: {
              select: {
                id: true,
                isCorrect: true,
                questionId: true,
              },
            },
          },
        },
        attempts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            score: true,
            totalMarks: true,
            startedAt: true,
            submittedAt: true,
            mockTest: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async updateUserRole(userId: string, role: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }
}

export const usersRepository = new UsersRepository();
