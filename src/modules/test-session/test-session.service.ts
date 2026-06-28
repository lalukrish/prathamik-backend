// import { TestStatus } from "@prisma/client";
// import { testSessionRepository } from "./test-session.repository";

// export class TestSessionService {
//   async getAvailableTests() {
//     return testSessionRepository.getPublishedTests();
//   }

//   async startTest(userId: string, mockTestId: string) {
//     const mockTest = await testSessionRepository.getMockTestById(mockTestId);

//     if (!mockTest) {
//       throw new Error("Mock test not found");
//     }

//     return testSessionRepository.createSession({
//       userId,
//       mockTestId,

//       status: TestStatus.IN_PROGRESS,

//       remainingSeconds: mockTest.durationMinutes * 60,

//       expiresAt: new Date(Date.now() + mockTest.durationMinutes * 60 * 1000),
//     });
//   }

//   async getSession(sessionId: string) {
//     return testSessionRepository.getSessionById(sessionId);
//   }

//   async pauseTest(sessionId: string) {
//     return testSessionRepository.updateSession(sessionId, {
//       status: TestStatus.PAUSED,
//     });
//   }

//   async resumeTest(sessionId: string) {
//     return testSessionRepository.updateSession(sessionId, {
//       status: TestStatus.IN_PROGRESS,
//     });
//   }

//   async submitAnswer(data: {
//     sessionId: string;
//     questionId: string;
//     optionId: string;
//   }) {
//     // Fetch the session to get userId + mockTestId
//     const session = await testSessionRepository.findById(data.sessionId);
//     if (!session) throw new Error("Session not found");

//     // Find or create a TestAttempt for this session
//     let attempt = await testSessionRepository.findAttemptBySession(
//       session.userId,
//       session.mockTestId,
//     );

//     if (!attempt) {
//       attempt = await testSessionRepository.createAttempt({
//         userId: session.userId,
//         mockTestId: session.mockTestId,
//       });
//     }

//     // Check if the selected option is correct
//     const option = await testSessionRepository.findOptionById(data.optionId);

//     return testSessionRepository.createAnswer({
//       sessionId: data.sessionId,
//       questionId: data.questionId,
//       selectedOptionId: data.optionId,
//       attemptId: attempt.id,
//       isCorrect: option?.isCorrect ?? false,
//     });
//   }

//   async submitTest(sessionId: string) {
//     return testSessionRepository.updateSession(sessionId, {
//       status: TestStatus.SUBMITTED,
//       submittedAt: new Date(),
//     });
//   }
// }

// export const testSessionService = new TestSessionService();

import { TestStatus } from "@prisma/client";
import { testSessionRepository } from "./test-session.repository";

export class TestSessionService {
  async getAvailableTests() {
    return testSessionRepository.getPublishedTests();
  }

  async startTest(userId: string, mockTestId: string) {
    const mockTest = await testSessionRepository.getMockTestById(mockTestId);

    if (!mockTest) {
      throw new Error("Mock test not found");
    }

    const remainingSeconds = mockTest.durationMinutes * 60;

    return testSessionRepository.createSession({
      userId,
      mockTestId,
      status: TestStatus.IN_PROGRESS,
      remainingSeconds,
      expiresAt: new Date(Date.now() + remainingSeconds * 1000),
    });
  }

  async getSession(sessionId: string) {
    const session = await testSessionRepository.getSessionById(sessionId);
    if (!session) throw new Error("Session not found");

    // If IN_PROGRESS, sync remainingSeconds from expiresAt in real time
    if (session.status === TestStatus.IN_PROGRESS) {
      const secondsLeft = Math.max(
        0,
        Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000),
      );

      // Auto-expire if time ran out
      if (secondsLeft === 0) {
        return this.submitTest(sessionId);
      }

      return { ...session, remainingSeconds: secondsLeft };
    }

    return session;
  }

  async pauseTest(sessionId: string) {
    const session = await testSessionRepository.findById(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.status !== TestStatus.IN_PROGRESS) {
      throw new Error("Only an in-progress test can be paused");
    }

    // Calculate how many seconds are actually left right now
    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000),
    );

    return testSessionRepository.updateSession(sessionId, {
      status: TestStatus.PAUSED,
      remainingSeconds, // persist the snapshot
      lastSeenAt: new Date(),
    });
  }

  async resumeTest(sessionId: string) {
    const session = await testSessionRepository.findById(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.status !== TestStatus.PAUSED) {
      throw new Error("Only a paused test can be resumed");
    }

    // Recalculate expiresAt from the saved remainingSeconds snapshot
    const newExpiresAt = new Date(Date.now() + session.remainingSeconds * 1000);

    return testSessionRepository.updateSession(sessionId, {
      status: TestStatus.IN_PROGRESS,
      expiresAt: newExpiresAt,
    });
  }

  async submitAnswer(data: {
    sessionId: string;
    questionId: string;
    optionId: string;
  }) {
    const session = await testSessionRepository.findById(data.sessionId);
    if (!session) throw new Error("Session not found");

    if (
      session.status !== TestStatus.IN_PROGRESS &&
      session.status !== TestStatus.PAUSED
    ) {
      throw new Error("Cannot submit answer — test is not active");
    }

    // Find or create a TestAttempt for this session
    let attempt = await testSessionRepository.findAttemptBySession(
      session.userId,
      session.mockTestId,
    );

    if (!attempt) {
      attempt = await testSessionRepository.createAttempt({
        userId: session.userId,
        mockTestId: session.mockTestId,
      });
    }

    const option = await testSessionRepository.findOptionById(data.optionId);
    if (!option) throw new Error("Option not found");

    // Upsert: update if this question was already answered, create otherwise
    return testSessionRepository.upsertAnswer({
      sessionId: data.sessionId,
      questionId: data.questionId,
      selectedOptionId: data.optionId,
      attemptId: attempt.id,
      isCorrect: option.isCorrect,
    });
  }

  async submitTest(sessionId: string) {
    const session = await testSessionRepository.getSessionById(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.status === TestStatus.SUBMITTED) {
      throw new Error("Test already submitted");
    }

    // ── Calculate score ──────────────────────────────────────────
    const questions = session.mockTest.questions;
    const answers = await testSessionRepository.getAnswersBySession(sessionId);

    const answerMap = new Map(answers.map((a) => [a.questionId, a]));

    let score = 0;

    for (const question of questions) {
      const answer = answerMap.get(question.id);
      if (!answer) continue; // not attempted — no marks, no negative marks

      if (answer.isCorrect) {
        score += question.marks;
      } else {
        score -= question.negativeMarks; // negativeMarks is 0 if not set
      }
    }

    const finalScore = Math.max(0, Math.round(score)); // floor at 0

    // ── Update session ───────────────────────────────────────────
    const updatedSession = await testSessionRepository.updateSession(
      sessionId,
      {
        status: TestStatus.SUBMITTED,
        submittedAt: new Date(),
        score: finalScore,
      },
    );

    // ── Update attempt score too ─────────────────────────────────
    const attempt = await testSessionRepository.findAttemptBySession(
      session.userId,
      session.mockTestId,
    );

    if (attempt) {
      await testSessionRepository.updateAttempt(attempt.id, {
        score: finalScore,
        totalMarks: session.mockTest.totalMarks,
        submittedAt: new Date(),
      });
    }

    return {
      ...updatedSession,
      score: finalScore,
      totalMarks: session.mockTest.totalMarks,
      totalQuestions: questions.length,
      attempted: answers.length,
      correct: answers.filter((a) => a.isCorrect).length,
      incorrect: answers.filter((a) => !a.isCorrect).length,
    };
  }
}

export const testSessionService = new TestSessionService();
