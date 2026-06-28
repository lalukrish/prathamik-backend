import { prisma } from "../../config/db";
import { SessionEvent, TestStatus } from "@prisma/client";

export const testSessionRepo = {
  // ── MockTest lookups ────────────────────────────────────────────

  findPublishedMockTestWithQuestions(mockTestId: string) {
    return prisma.mockTest.findFirst({
      where: { id: mockTestId, isPublished: true },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: { options: true, subject: true },
        },
      },
    });
  },

  findAvailableTests() {
    return prisma.mockTest.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: { questions: true },
    });
  },

  // ── TestSession + TestAttempt creation ──────────────────────────

  createSessionWithAttempt(params: {
    userId: string;
    mockTestId: string;
    remainingSeconds: number;
    expiresAt: Date;
    totalMarks: number;
  }) {
    const { userId, mockTestId, remainingSeconds, expiresAt, totalMarks } =
      params;

    return prisma.$transaction(async (tx) => {
      const attempt = await tx.testAttempt.create({
        data: {
          userId,
          mockTestId,
          totalMarks,
        },
      });

      const session = await tx.testSession.create({
        data: {
          userId,
          mockTestId,
          status: TestStatus.IN_PROGRESS,
          remainingSeconds,
          expiresAt,
        },
      });

      await tx.sessionActivity.create({
        data: {
          sessionId: session.id,
          eventType: SessionEvent.START,
        },
      });

      return { attempt, session };
    });
  },

  // ── TestSession lookups ──────────────────────────────────────────

  findSessionById(sessionId: string) {
    return prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        mockTest: {
          include: {
            questions: {
              orderBy: { sortOrder: "asc" },
              include: { options: true, subject: true },
            },
          },
        },
        answers: true,
      },
    });
  },

  findSessionWithAttemptContext(sessionId: string) {
    return prisma.testSession.findUnique({
      where: { id: sessionId },
      include: { mockTest: true },
    });
  },

  // Find the TestAttempt that belongs to this user + mockTest and is still open
  // (no submittedAt yet) — created alongside the session at start time.
  findOpenAttempt(userId: string, mockTestId: string) {
    return prisma.testAttempt.findFirst({
      where: { userId, mockTestId, submittedAt: null },
      orderBy: { startedAt: "desc" },
    });
  },

  updateSessionStatus(
    sessionId: string,
    status: TestStatus,
    extra: Record<string, unknown> = {},
  ) {
    return prisma.testSession.update({
      where: { id: sessionId },
      data: { status, lastSeenAt: new Date(), ...extra },
    });
  },

  updateRemainingSeconds(sessionId: string, remainingSeconds: number) {
    return prisma.testSession.update({
      where: { id: sessionId },
      data: { remainingSeconds, lastSeenAt: new Date() },
    });
  },

  logActivity(
    sessionId: string,
    eventType: SessionEvent,
    metadata?: Record<string, unknown>,
  ) {
    return prisma.sessionActivity.create({
      data: { sessionId, eventType, metadata: metadata as any },
    });
  },

  // ── Answers ───────────────────────────────────────────────────────

  findQuestionWithOptions(questionId: string) {
    return prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });
  },

  upsertAnswer(params: {
    attemptId: string;
    sessionId: string;
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }) {
    const { attemptId, sessionId, questionId, selectedOptionId, isCorrect } =
      params;

    return prisma.userAnswer.upsert({
      where: { sessionId_questionId: { sessionId, questionId } },
      create: {
        attemptId,
        sessionId,
        questionId,
        selectedOptionId,
        isCorrect,
        isVisited: true,
      },
      update: {
        selectedOptionId,
        isCorrect,
        isVisited: true,
      },
    });
  },

  findAnswersBySession(sessionId: string) {
    return prisma.userAnswer.findMany({
      where: { sessionId },
      include: {
        selectedOption: true,
        question: { include: { options: true, subject: true } },
      },
    });
  },

  // ── Submission / grading ─────────────────────────────────────────

  submitSessionAndAttempt(params: {
    sessionId: string;
    attemptId: string;
    netScore: number;
  }) {
    const { sessionId, attemptId, netScore } = params;
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const session = await tx.testSession.update({
        where: { id: sessionId },
        data: {
          status: TestStatus.SUBMITTED,
          submittedAt: now,
          score: Math.round(netScore),
        },
      });

      const attempt = await tx.testAttempt.update({
        where: { id: attemptId },
        data: {
          submittedAt: now,
          score: Math.round(netScore),
        },
      });

      await tx.sessionActivity.create({
        data: { sessionId, eventType: SessionEvent.SUBMIT },
      });

      return { session, attempt };
    });
  },

  // ── Result aggregation ────────────────────────────────────────────

  findResultData(sessionId: string) {
    return prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        mockTest: {
          include: {
            questions: {
              orderBy: { sortOrder: "asc" },
              include: { options: true, subject: true },
            },
          },
        },
        answers: {
          include: { selectedOption: true },
        },
      },
    });
  },

  // For computing rank/percentile among everyone who has submitted this mock test.
  findSubmittedAttemptScores(mockTestId: string) {
    return prisma.testAttempt.findMany({
      where: { mockTestId, submittedAt: { not: null } },
      select: { id: true, userId: true, score: true },
      orderBy: { score: "desc" },
    });
  },
};
