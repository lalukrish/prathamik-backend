import { UserStatus } from "@prisma/client";
import { usersRepository } from "./Users.repository";

// Build per-user stats from raw session/attempt data
function buildUserStats(sessions: any[], attempts: any[]) {
  const totalSessions = sessions.length;
  const submitted = sessions.filter((s) => s.status === "SUBMITTED");
  const inProgress = sessions.filter((s) => s.status === "IN_PROGRESS");
  const paused = sessions.filter((s) => s.status === "PAUSED");
  const expired = sessions.filter((s) => s.status === "EXPIRED");

  const scores = submitted.map((s) => s.score ?? 0);
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  // Last active from most recent session
  const lastActive =
    sessions.length > 0
      ? sessions.reduce((latest, s) => {
          const d = new Date(s.startedAt);
          return d > new Date(latest) ? s.startedAt : latest;
        }, sessions[0].startedAt)
      : null;

  return {
    totalSessions,
    submitted: submitted.length,
    inProgress: inProgress.length,
    paused: paused.length,
    expired: expired.length,
    avgScore,
    bestScore,
    lastActive,
  };
}

// Shape the summary list row
function buildUserSummary(user: any) {
  const stats = buildUserStats(user.testSessions, user.attempts);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    stats,
  };
}

// Shape the full detail view
function buildUserDetail(user: any) {
  const stats = buildUserStats(user.testSessions, user.attempts);

  const sessions = user.testSessions.map((s: any) => {
    const totalQuestions = s.mockTest.questions?.length ?? 0;
    const correct = s.answers?.filter((a: any) => a.isCorrect).length ?? 0;
    const attempted = s.answers?.length ?? 0;

    return {
      sessionId: s.id,
      mockTestId: s.mockTest.id,
      title: s.mockTest.title,
      status: s.status,
      score: s.score,
      totalMarks: s.mockTest.totalMarks,
      totalQuestions,
      attempted,
      correct,
      incorrect: attempted - correct,
      percentage:
        s.mockTest.totalMarks > 0
          ? Math.round(((s.score ?? 0) / s.mockTest.totalMarks) * 100)
          : 0,
      startedAt: s.startedAt,
      submittedAt: s.submittedAt,
      durationMinutes: s.mockTest.durationMinutes,
    };
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    stats,
    sessions,
  };
}

export class UsersService {
  // GET /users — paginated list with stats
  async getAllUsers(filters: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const { users, total, page, limit } = await usersRepository.getAllUsers({
      ...filters,
      status: filters.status as UserStatus | undefined,
    });

    return {
      users: users.map(buildUserSummary),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET /users/:userId — full detail
  async getUserById(userId: string) {
    const user = await usersRepository.getUserById(userId);
    if (!user) throw new Error("User not found");
    return buildUserDetail(user);
  }

  // PATCH /users/:userId/status
  async updateStatus(userId: string, status: string) {
    if (!["ACTIVE", "BLOCKED"].includes(status)) {
      throw new Error("Invalid status. Must be ACTIVE or BLOCKED");
    }
    return usersRepository.updateUserStatus(userId, status as UserStatus);
  }

  // PATCH /users/:userId/role
  async updateRole(userId: string, role: string) {
    if (!["ADMIN", "USER"].includes(role)) {
      throw new Error("Invalid role. Must be ADMIN or USER");
    }
    return usersRepository.updateUserRole(userId, role);
  }
}

export const usersService = new UsersService();
