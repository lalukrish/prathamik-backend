import { TestStatus } from "@prisma/client";
import { testSessionRepo } from "./result.repository";

const TWO_HOUR_GRACE_MS = 0; // expiresAt = startedAt + durationMinutes, no extra grace by default

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const testSessionService = {
  // ── List available tests ────────────────────────────────────────

  async getAvailableTests() {
    return testSessionRepo.findAvailableTests();
  },

  // ── Start a test ─────────────────────────────────────────────────

  async startTest(userId: string, mockTestId: string) {
    const mockTest =
      await testSessionRepo.findPublishedMockTestWithQuestions(mockTestId);
    if (!mockTest) {
      throw new ApiError(404, "Test not found or not published.");
    }
    if (mockTest.questions.length === 0) {
      throw new ApiError(400, "This test has no questions yet.");
    }

    const remainingSeconds = mockTest.durationMinutes * 60;
    const expiresAt = new Date(
      Date.now() + remainingSeconds * 1000 + TWO_HOUR_GRACE_MS,
    );

    const { session } = await testSessionRepo.createSessionWithAttempt({
      userId,
      mockTestId,
      remainingSeconds,
      expiresAt,
      totalMarks: mockTest.totalMarks,
    });

    return { id: session.id };
  },

  // ── Get a session (for resuming the exam page) ───────────────────

  async getSession(sessionId: string, userId: string) {
    const session = await testSessionRepo.findSessionById(sessionId);
    if (!session) {
      throw new ApiError(404, "Session not found.");
    }
    if (session.userId !== userId) {
      throw new ApiError(403, "This session does not belong to you.");
    }

    const remainingSeconds = computeLiveRemainingSeconds(session);

    const answers: Record<string, string> = {};
    for (const a of session.answers) {
      answers[a.questionId] = a.selectedOptionId;
    }

    return {
      id: session.id,
      status: session.status,
      remainingSeconds,
      studentName: undefined, // attach from req.user in controller if available
      mockTest: {
        id: session.mockTest.id,
        title: session.mockTest.title,
        description: session.mockTest.description,
        durationMinutes: session.mockTest.durationMinutes,
        totalMarks: session.mockTest.totalMarks,
        questions: session.mockTest.questions.map((q) => ({
          id: q.id,
          question: q.question,
          imageUrl: q.imageUrl,
          type: q.type,
          subjectId: q.subjectId,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          difficulty: q.difficulty,
          sortOrder: q.sortOrder,
          options: q.options.map((o) => ({ id: o.id, text: o.text })),
        })),
      },
      answers,
    };
  },

  // ── Submit / change an answer ─────────────────────────────────────

  async submitAnswer(
    sessionId: string,
    userId: string,
    questionId: string,
    selectedOptionId: string,
  ) {
    const session =
      await testSessionRepo.findSessionWithAttemptContext(sessionId);
    if (!session) throw new ApiError(404, "Session not found.");
    if (session.userId !== userId)
      throw new ApiError(403, "This session does not belong to you.");
    if (session.status !== TestStatus.IN_PROGRESS) {
      throw new ApiError(
        409,
        `Cannot answer — session is ${session.status.toLowerCase()}.`,
      );
    }

    const question = await testSessionRepo.findQuestionWithOptions(questionId);
    if (!question || question.mockTestId !== session.mockTestId) {
      throw new ApiError(400, "Question does not belong to this test.");
    }

    const option = question.options.find((o) => o.id === selectedOptionId);
    if (!option) {
      throw new ApiError(400, "Option does not belong to this question.");
    }

    const attempt = await testSessionRepo.findOpenAttempt(
      userId,
      session.mockTestId,
    );
    if (!attempt) {
      throw new ApiError(409, "No open attempt found for this session.");
    }

    const answer = await testSessionRepo.upsertAnswer({
      attemptId: attempt.id,
      sessionId,
      questionId,
      selectedOptionId,
      isCorrect: option.isCorrect,
    });

    return {
      questionId,
      selectedOptionId: answer.selectedOptionId,
      isCorrect: answer.isCorrect,
    };
  },

  // ── Pause / Resume ─────────────────────────────────────────────────

  async pauseTest(sessionId: string, userId: string) {
    const session = await assertOwnedActiveSession(sessionId, userId, [
      TestStatus.IN_PROGRESS,
    ]);

    const remainingSeconds = computeLiveRemainingSeconds(session);
    await testSessionRepo.updateRemainingSeconds(sessionId, remainingSeconds);
    const updated = await testSessionRepo.updateSessionStatus(
      sessionId,
      TestStatus.PAUSED,
    );
    await testSessionRepo.logActivity(sessionId, "PAUSE");

    return { id: updated.id, status: updated.status, remainingSeconds };
  },

  async resumeTest(sessionId: string, userId: string) {
    const session = await assertOwnedActiveSession(sessionId, userId, [
      TestStatus.PAUSED,
    ]);

    const expiresAt = new Date(Date.now() + session.remainingSeconds * 1000);
    const updated = await testSessionRepo.updateSessionStatus(
      sessionId,
      TestStatus.IN_PROGRESS,
      { expiresAt },
    );
    await testSessionRepo.logActivity(sessionId, "RESUME");

    return {
      id: updated.id,
      status: updated.status,
      remainingSeconds: session.remainingSeconds,
    };
  },

  // ── Submit the whole test (grading) ─────────────────────────────────

  async submitTest(sessionId: string, userId: string, isAutoSubmit = false) {
    const session = await testSessionRepo.findResultData(sessionId);
    if (!session) throw new ApiError(404, "Session not found.");
    if (session.userId !== userId)
      throw new ApiError(403, "This session does not belong to you.");

    if (session.status === TestStatus.SUBMITTED) {
      // Idempotent: submitting twice just returns the existing result.
      return { id: session.id };
    }

    const attempt = await testSessionRepo.findOpenAttempt(
      userId,
      session.mockTestId,
    );
    if (!attempt)
      throw new ApiError(409, "No open attempt found for this session.");

    const { correctScore, negativeScore } = gradeAnswers(
      session.mockTest.questions,
      session.answers,
    );
    const netScore = correctScore - negativeScore;

    await testSessionRepo.submitSessionAndAttempt({
      sessionId,
      attemptId: attempt.id,
      netScore,
    });

    await testSessionRepo.logActivity(
      sessionId,
      isAutoSubmit ? "AUTO_SUBMIT" : "SUBMIT",
    );

    return { id: session.id };
  },

  // ── Build the full result payload ────────────────────────────────────

  async getResult(sessionId: string, userId: string) {
    const session = await testSessionRepo.findResultData(sessionId);
    if (!session) throw new ApiError(404, "Session not found.");
    // if (session.userId !== userId)
    //   throw new ApiError(403, "This session does not belong to you.");
    // if (session.status !== TestStatus.SUBMITTED) {
    //   throw new ApiError(409, "This test has not been submitted yet.");
    // }

    const answerByQuestionId = new Map(
      session.answers.map((a) => [a.questionId, a]),
    );

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let correctScore = 0;
    let negativeScore = 0;

    const subjectMap = new Map<
      string,
      {
        subjectId: string;
        subjectName: string;
        total: number;
        correct: number;
        incorrect: number;
        skipped: number;
        marksScored: number;
        marksTotal: number;
      }
    >();

    const difficultyMap = new Map<
      string,
      { difficulty: string; total: number; correct: number }
    >();

    const questions = session.mockTest.questions.map((q) => {
      const answer = answerByQuestionId.get(q.id);
      const correctOption = q.options.find((o) => o.isCorrect);
      const correctOptionId = correctOption?.id ?? "";

      let outcome: "CORRECT" | "INCORRECT" | "SKIPPED";
      let marksAwarded = 0;

      if (!answer) {
        outcome = "SKIPPED";
        skippedCount += 1;
      } else if (answer.isCorrect) {
        outcome = "CORRECT";
        marksAwarded = q.marks;
        correctCount += 1;
        correctScore += q.marks;
      } else {
        outcome = "INCORRECT";
        marksAwarded = -q.negativeMarks;
        incorrectCount += 1;
        negativeScore += q.negativeMarks;
      }

      // Subject rollup
      const subjKey = q.subjectId;
      if (!subjectMap.has(subjKey)) {
        subjectMap.set(subjKey, {
          subjectId: q.subjectId,
          subjectName: q.subject.name,
          total: 0,
          correct: 0,
          incorrect: 0,
          skipped: 0,
          marksScored: 0,
          marksTotal: 0,
        });
      }
      const subjAgg = subjectMap.get(subjKey)!;
      subjAgg.total += 1;
      subjAgg.marksTotal += q.marks;
      if (outcome === "CORRECT") {
        subjAgg.correct += 1;
        subjAgg.marksScored += q.marks;
      } else if (outcome === "INCORRECT") {
        subjAgg.incorrect += 1;
        subjAgg.marksScored -= q.negativeMarks;
      } else {
        subjAgg.skipped += 1;
      }

      // Difficulty rollup
      const diffKey = q.difficulty;
      if (!difficultyMap.has(diffKey)) {
        difficultyMap.set(diffKey, {
          difficulty: diffKey,
          total: 0,
          correct: 0,
        });
      }
      const diffAgg = difficultyMap.get(diffKey)!;
      diffAgg.total += 1;
      if (outcome === "CORRECT") diffAgg.correct += 1;

      return {
        id: q.id,
        question: q.question,
        imageUrl: q.imageUrl,
        subjectId: q.subjectId,
        description: q.description ?? null, // ← fix this

        subjectName: q.subject.name,
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
        correctOptionId,
        selectedOptionId: answer?.selectedOptionId ?? null,
        outcome,
        marksAwarded,
      };
    });

    const totalQuestions = questions.length;
    const attemptedCount = correctCount + incorrectCount;
    const accuracy =
      attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

    const timeTakenSeconds =
      session.submittedAt && session.startedAt
        ? Math.round(
            (session.submittedAt.getTime() - session.startedAt.getTime()) /
              1000,
          )
        : session.mockTest.durationMinutes * 60 - session.remainingSeconds;

    const { rank, totalParticipants } = await computeRank(
      session.mockTestId,
      userId,
      correctScore - negativeScore,
    );

    return {
      sessionId: session.id,
      mockTestId: session.mockTestId,
      mockTestTitle: session.mockTest.title,
      submittedAt: session.submittedAt,
      durationMinutes: session.mockTest.durationMinutes,
      timeTakenSeconds: Math.max(0, timeTakenSeconds),

      totalMarks: session.mockTest.totalMarks,
      correctScore,
      negativeScore,
      netScore: correctScore - negativeScore,

      accuracy,
      rank,
      totalParticipants,

      correctCount,
      incorrectCount,
      skippedCount,
      totalQuestions,

      subjectBreakdown: Array.from(subjectMap.values()),
      difficultyBreakdown: Array.from(difficultyMap.values()),
      questions,
    };
  },
};

// ── Internal helpers ──────────────────────────────────────────────────

function computeLiveRemainingSeconds(session: {
  status: TestStatus;
  remainingSeconds: number;
  expiresAt: Date;
}) {
  if (session.status !== TestStatus.IN_PROGRESS) {
    return session.remainingSeconds;
  }
  const liveRemaining = Math.round(
    (session.expiresAt.getTime() - Date.now()) / 1000,
  );
  return Math.max(0, liveRemaining);
}

async function assertOwnedActiveSession(
  sessionId: string,
  userId: string,
  allowedStatuses: TestStatus[],
) {
  const session =
    await testSessionRepo.findSessionWithAttemptContext(sessionId);
  if (!session) throw new ApiError(404, "Session not found.");
  if (session.userId !== userId)
    throw new ApiError(403, "This session does not belong to you.");
  if (!allowedStatuses.includes(session.status)) {
    throw new ApiError(
      409,
      `Cannot perform this action — session is ${session.status.toLowerCase()}.`,
    );
  }
  return session;
}

function gradeAnswers(
  questions: { id: string; marks: number; negativeMarks: number }[],
  answers: { questionId: string; isCorrect: boolean }[],
) {
  const answerByQuestionId = new Map(answers.map((a) => [a.questionId, a]));
  let correctScore = 0;
  let negativeScore = 0;

  for (const q of questions) {
    const answer = answerByQuestionId.get(q.id);
    if (!answer) continue; // skipped — no marks either way
    if (answer.isCorrect) correctScore += q.marks;
    else negativeScore += q.negativeMarks;
  }

  return { correctScore, negativeScore };
}

async function computeRank(
  mockTestId: string,
  userId: string,
  myNetScore: number,
) {
  const scores = await testSessionRepo.findSubmittedAttemptScores(mockTestId);
  if (scores.length === 0) return { rank: null, totalParticipants: null };

  // score on TestAttempt is the rounded net score persisted at submit time.
  const sorted = [...scores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const myIndex = sorted.findIndex((s) => s.userId === userId);

  return {
    rank: myIndex >= 0 ? myIndex + 1 : null,
    totalParticipants: sorted.length,
  };
}

export { ApiError };
