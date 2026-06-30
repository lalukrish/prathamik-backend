import { dashboardRepository } from "./dashboard.repository";

interface SubjectBreakdown {
  subjectId: string;
  subjectName: string;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  scored: number;
  maxMarks: number;
  negativeMarks: number;
}

function buildSessionSummary(session: any) {
  const questions = session.mockTest.questions;
  const answers = session.answers;
  const answerMap = new Map<string, any>(
    answers.map((a: any) => [a.questionId, a]),
  );

  let positiveScore = 0;
  let negativeScore = 0;
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;

  // Per-subject breakdown
  const subjectMap = new Map<string, SubjectBreakdown>();

  for (const question of questions) {
    const subjectId = question.subject?.id ?? "unknown";
    const subjectName = question.subject?.name ?? "General";

    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, {
        subjectId,
        subjectName,
        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        scored: 0,
        maxMarks: 0,
        negativeMarks: 0,
      });
    }

    const sub = subjectMap.get(subjectId)!;
    sub.total++;
    sub.maxMarks += question.marks;

    const answer = answerMap.get(question.id);

    if (!answer) {
      skipped++;
      sub.skipped++;
    } else if (answer.selectedOption.isCorrect) {
      correct++;
      positiveScore += question.marks;
      sub.correct++;
      sub.attempted++;
      sub.scored += question.marks;
    } else {
      incorrect++;
      negativeScore += question.negativeMarks;
      sub.incorrect++;
      sub.attempted++;
      sub.scored -= question.negativeMarks;
      sub.negativeMarks += question.negativeMarks;
    }
  }

  const finalScore = Math.max(0, positiveScore - negativeScore);
  const totalQuestions = questions.length;
  const accuracy =
    correct + incorrect > 0
      ? Math.round((correct / (correct + incorrect)) * 100)
      : 0;

  const timeTakenSeconds = session.submittedAt
    ? Math.floor(
        (new Date(session.submittedAt).getTime() -
          new Date(session.startedAt).getTime()) /
          1000,
      )
    : null;

  return {
    sessionId: session.id,
    mockTestId: session.mockTest.id,
    title: session.mockTest.title,
    status: session.status,
    startedAt: session.startedAt,
    submittedAt: session.submittedAt,
    timeTakenSeconds,
    score: {
      final: finalScore,
      positive: positiveScore,
      negative: negativeScore,
      total: session.mockTest.totalMarks,
      percentage: Math.round((finalScore / session.mockTest.totalMarks) * 100),
    },
    questions: {
      total: totalQuestions,
      attempted: correct + incorrect,
      correct,
      incorrect,
      skipped,
      accuracy,
    },
    subjectBreakdown: Array.from(subjectMap.values()),
  };
}

export class DashboardService {
  // List of all attended tests with summary
  async getAttendedTests(userId: string) {
    const sessions = await dashboardRepository.getAttemptsByUser(userId);
    return sessions.map(buildSessionSummary);
  }

  // Full detail of one test result
  async getTestResult(sessionId: string, userId: string) {
    const session = await dashboardRepository.getSessionById(sessionId, userId);
    if (!session) throw new Error("Result not found");
    if (!["SUBMITTED", "EXPIRED"].includes(session.status)) {
      throw new Error("Test not yet submitted");
    }

    const summary = buildSessionSummary(session);

    // Build per-question review (with correct answer revealed)
    const answerMap = new Map(
      session.answers.map((a: any) => [a.questionId, a]),
    );

    const questionReview = session.mockTest.questions.map(
      (q: any, idx: number) => {
        const answer = answerMap.get(q.id) as any;
        const correctOption = q.options.find((o: any) => o.isCorrect);

        return {
          index: idx + 1,
          questionId: q.id,
          questionText: q.question,
          subject: q.subject?.name ?? "General",
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          difficulty: q.difficulty,
          options: q.options.map((o: any) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect,
          })),
          selectedOptionId: answer?.selectedOption?.id ?? null,
          selectedOptionText: answer?.selectedOption?.text ?? null,
          correctOptionId: correctOption?.id ?? null,
          correctOptionText: correctOption?.text ?? null,
          result: !answer
            ? "skipped"
            : answer.selectedOption.isCorrect
              ? "correct"
              : "incorrect",
          marksAwarded: !answer
            ? 0
            : answer.selectedOption.isCorrect
              ? q.marks
              : -q.negativeMarks,
        };
      },
    );

    return { ...summary, questionReview };
  }

  // Overall stats card data
  async getOverallStats(userId: string) {
    const [stats, sessions] = await Promise.all([
      dashboardRepository.getOverallStats(userId),
      dashboardRepository.getAttemptsByUser(userId),
    ]);

    const summaries = sessions.map(buildSessionSummary);

    const totalTests = stats._count.id;
    const avgScore = stats._avg.score ?? 0;
    const bestScore = stats._max.score ?? 0;

    const totalCorrect = summaries.reduce((s, x) => s + x.questions.correct, 0);
    const totalAttempted = summaries.reduce(
      (s, x) => s + x.questions.attempted,
      0,
    );
    const overallAccuracy =
      totalAttempted > 0
        ? Math.round((totalCorrect / totalAttempted) * 100)
        : 0;

    const totalNegative = summaries.reduce((s, x) => s + x.score.negative, 0);

    // Best subject
    const subjectScoreMap = new Map<string, { scored: number; max: number }>();
    for (const s of summaries) {
      for (const sub of s.subjectBreakdown) {
        const prev = subjectScoreMap.get(sub.subjectName) ?? {
          scored: 0,
          max: 0,
        };
        subjectScoreMap.set(sub.subjectName, {
          scored: prev.scored + sub.scored,
          max: prev.max + sub.maxMarks,
        });
      }
    }

    const subjectPerformance = Array.from(subjectScoreMap.entries()).map(
      ([name, { scored, max }]) => ({
        subject: name,
        scored: Math.max(0, scored),
        maxMarks: max,
        percentage: max > 0 ? Math.round((Math.max(0, scored) / max) * 100) : 0,
      }),
    );

    return {
      totalTests,
      avgScore: Math.round(avgScore),
      bestScore,
      overallAccuracy,
      totalNegativeMarks: Math.round(totalNegative * 100) / 100,
      subjectPerformance,
    };
  }

  // In-progress / paused sessions the user can resume
  async getInProgressTests(userId: string) {
    const sessions = await dashboardRepository.getInProgressSessions(userId);
    return sessions.map((s) => ({
      sessionId: s.id,
      mockTestId: s.mockTest.id,
      title: s.mockTest.title,
      status: s.status,
      startedAt: s.startedAt,
      remainingSeconds: s.remainingSeconds,
      totalMarks: s.mockTest.totalMarks,
      durationMinutes: s.mockTest.durationMinutes,
    }));
  }
}

export const dashboardService = new DashboardService();
