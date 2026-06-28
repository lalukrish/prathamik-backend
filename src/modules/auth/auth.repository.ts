import { prisma } from "../../config/db";

export const authRepository = {
  findByEmail: async (email: string) =>
    prisma.user.findUnique(
      {
        where: { email },
        include: {
          organization: {
            select: {
              name: true,
            },
          },
        },
      }),

  findById: async (id: string) => prisma.user.findUnique({ where: { id } }),

  createSession: async (data: {
    userId: string;
    tokenHash: string;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    expiresAt: Date;
  }) => prisma.session.create({ data }),

  updateSessionToken: async (sessionId: string, tokenHash: string) =>
    prisma.session.update({
      where: { id: sessionId },
      data: { tokenHash },
    }),

  findActiveSession: async (tokenHash: string) =>
    prisma.session.findFirst({
      where: { tokenHash, isActive: true, expiresAt: { gt: new Date() } },
    }),

  findSessionById: async (sessionId: string) =>
    prisma.session.findFirst({
      where: { id: sessionId, isActive: true, expiresAt: { gt: new Date() } },
    }),

  deactivateSession: async (tokenHash: string) =>
    prisma.session.deleteMany({
      where: { tokenHash },
    }),

  deactivateAllUserSessions: async (userId: string) =>
    prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    }),
  updatePassword: async (userId: string, password: string) => {
    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        password,
      },
    });
  },
};
