import { prisma } from "../../config/db";

export class DashboardRepository {
  async getAttemptsByUser(userId: string) {
    return prisma.testSession.findMany({
      where: {
        userId,
        status: { in: ["SUBMITTED", "EXPIRED"] },
      },
      orderBy: { submittedAt: "desc" },
      include: {
        mockTest: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            durationMinutes: true,
            questions: {
              select: { id: true, marks: true, negativeMarks: true },
            },
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                marks: true,
                negativeMarks: true,
                subject: { select: { id: true, name: true } },
              },
            },
            selectedOption: {
              select: { id: true, isCorrect: true },
            },
          },
        },
      },
    });
  }

  async getSessionById(sessionId: string, userId: string) {
    return prisma.testSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        mockTest: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            durationMinutes: true,
            questions: {
              orderBy: { sortOrder: "asc" },
              include: {
                options: {
                  select: { id: true, text: true, isCorrect: true },
                },
                subject: { select: { id: true, name: true } },
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                marks: true,
                negativeMarks: true,
                subject: { select: { id: true, name: true } },
              },
            },
            selectedOption: {
              select: { id: true, text: true, isCorrect: true },
            },
          },
        },
      },
    });
  }

  async getOverallStats(userId: string) {
    return prisma.testSession.aggregate({
      where: {
        userId,
        status: { in: ["SUBMITTED", "EXPIRED"] },
      },
      _count: { id: true },
      _avg: { score: true },
      _max: { score: true },
      _min: { score: true },
    });
  }

  async getInProgressSessions(userId: string) {
    return prisma.testSession.findMany({
      where: { userId, status: { in: ["IN_PROGRESS", "PAUSED"] } },
      orderBy: { startedAt: "desc" },
      include: {
        mockTest: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            durationMinutes: true,
          },
        },
      },
    });
  }
}

export const dashboardRepository = new DashboardRepository();
