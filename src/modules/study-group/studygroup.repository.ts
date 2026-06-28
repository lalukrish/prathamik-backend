// studyGroup.repo.ts
import { prisma } from "../../config/db";
import { TopicImportance } from "@prisma/client";

export const studyGroupRepository = {
  async createTopic(data: {
    userId: string;
    category: string;
    title: string;
    content: string;
  }) {
    return prisma.studyTopic.create({
      data: {
        userId: data.userId,
        category: data.category as any,
        title: data.title,
        content: data.content,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  },

  async countTodayByUser(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return prisma.studyTopic.count({
      where: { userId, createdAt: { gte: start, lte: end } },
    });
  },

  async findByCategory(category: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return prisma.studyTopic.findMany({
      where: { category: category as any },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
        votes: true,
      },
    });
  },

  async upsertVote(
    userId: string,
    topicId: string,
    importance: TopicImportance,
  ) {
    return prisma.topicVote.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { importance },
      create: { userId, topicId, importance },
    });
  },

  async removeVote(userId: string, topicId: string) {
    return prisma.topicVote.deleteMany({
      where: { userId, topicId },
    });
  },

  async getVoteCounts(topicId: string) {
    const votes = await prisma.topicVote.groupBy({
      by: ["importance"],
      where: { topicId },
      _count: { importance: true },
    });

    return {
      IMPORTANT: 0,
      MEDIUM_IMPORTANT: 0,
      LESS_IMPORTANT: 0,
      ...Object.fromEntries(
        votes.map((v) => [v.importance, v._count.importance]),
      ),
    };
  },
};
