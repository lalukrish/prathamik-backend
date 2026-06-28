// import { prisma } from "../../config/db";

// export class TestSessionRepository {
//   async getPublishedTests() {
//     return prisma.mockTest.findMany({
//       //   where: {
//       //     isPublished: true || false,
//       //   },
//       include: {
//         questions: true,
//       },
//     });
//   }

//   async getMockTestById(id: string) {
//     return prisma.mockTest.findUnique({
//       where: { id },
//       include: {
//         questions: {
//           include: {
//             options: true,
//             subject: true,
//           },
//         },
//       },
//     });
//   }

//   async createSession(data: any) {
//     return prisma.testSession.create({
//       data,
//     });
//   }

//   async getSessionById(id: string) {
//     return prisma.testSession.findUnique({
//       where: { id },
//       include: {
//         mockTest: {
//           include: {
//             questions: {
//               include: {
//                 options: true,
//                 subject: true,
//               },
//             },
//           },
//         },
//       },
//     });
//   }

//   async updateSession(id: string, data: any) {
//     return prisma.testSession.update({
//       where: { id },
//       data,
//     });
//   }

//   async findById(sessionId: string) {
//     return prisma.testSession.findUnique({
//       where: { id: sessionId },
//     });
//   }

//   async findAttemptBySession(userId: string, mockTestId: string) {
//     return prisma.testAttempt.findFirst({
//       where: { userId, mockTestId },
//     });
//   }

//   async createAttempt(data: { userId: string; mockTestId: string }) {
//     return prisma.testAttempt.create({
//       data: {
//         userId: data.userId,
//         mockTestId: data.mockTestId,
//       },
//     });
//   }

//   async findOptionById(optionId: string) {
//     return prisma.option.findUnique({
//       where: { id: optionId },
//     });
//   }

//   async createAnswer(data: {
//     sessionId: string;
//     questionId: string;
//     selectedOptionId: string;
//     attemptId: string;
//     isCorrect: boolean;
//   }) {
//     return prisma.userAnswer.create({
//       data,
//     });
//   }
// }

// export const testSessionRepository = new TestSessionRepository();

import { prisma } from "../../config/db";

export class TestSessionRepository {
  async getPublishedTests() {
    return prisma.mockTest.findMany({
      include: {
        questions: true,
      },
    });
  }

  async getMockTestById(id: string) {
    return prisma.mockTest.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
            subject: true,
          },
        },
      },
    });
  }

  async createSession(data: any) {
    return prisma.testSession.create({ data });
  }

  async getSessionById(id: string) {
    return prisma.testSession.findUnique({
      where: { id },
      include: {
        mockTest: {
          include: {
            questions: {
              orderBy: { sortOrder: "asc" },
              include: {
                options: {
                  select: {
                    // Never expose isCorrect to the client during the test
                    id: true,
                    text: true,
                    questionId: true,
                  },
                },
                subject: true,
              },
            },
          },
        },
      },
    });
  }

  async updateSession(id: string, data: any) {
    return prisma.testSession.update({ where: { id }, data });
  }

  async findById(sessionId: string) {
    return prisma.testSession.findUnique({ where: { id: sessionId } });
  }

  async findAttemptBySession(userId: string, mockTestId: string) {
    return prisma.testAttempt.findFirst({ where: { userId, mockTestId } });
  }

  async createAttempt(data: { userId: string; mockTestId: string }) {
    return prisma.testAttempt.create({ data });
  }

  async updateAttempt(
    id: string,
    data: { score: number; totalMarks: number; submittedAt: Date },
  ) {
    return prisma.testAttempt.update({ where: { id }, data });
  }

  async findOptionById(optionId: string) {
    return prisma.option.findUnique({ where: { id: optionId } });
  }

  // Upsert: one answer row per (sessionId + questionId)
  async upsertAnswer(data: {
    sessionId: string;
    questionId: string;
    selectedOptionId: string;
    attemptId: string;
    isCorrect: boolean;
  }) {
    return prisma.userAnswer.upsert({
      where: {
        // requires a unique constraint — see note below
        sessionId_questionId: {
          sessionId: data.sessionId,
          questionId: data.questionId,
        },
      },
      update: {
        selectedOptionId: data.selectedOptionId,
        isCorrect: data.isCorrect,
      },
      create: {
        sessionId: data.sessionId,
        questionId: data.questionId,
        selectedOptionId: data.selectedOptionId,
        attemptId: data.attemptId,
        isCorrect: data.isCorrect,
        isVisited: true,
      },
    });
  }

  async getAnswersBySession(sessionId: string) {
    return prisma.userAnswer.findMany({
      where: { sessionId },
    });
  }
}

export const testSessionRepository = new TestSessionRepository();
