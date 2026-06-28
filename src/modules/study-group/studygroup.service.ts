// studyGroup.service.ts
import { studyGroupRepository } from "./studygroup.repository";
import { TopicImportance } from "@prisma/client";

export const studyGroupService = {
  async createTopic(
    userId: string,
    data: { category: string; title: string; content: string },
  ) {
    const todayCount = await studyGroupRepository.countTodayByUser(userId);
    if (todayCount >= 2) throw new Error("You can only post 2 topics per day.");

    return studyGroupRepository.createTopic({ userId, ...data });
  },

  async getByCategory(category: string, page = 1, limit = 10) {
    const topics = await studyGroupRepository.findByCategory(
      category,
      page,
      limit,
    );

    return topics.map((t) => ({
      id: t.id,
      title: t.title,
      content: t.content,
      category: t.category,
      author: t.user,
      createdAt: t.createdAt,
      votes: {
        IMPORTANT: t.votes.filter((v) => v.importance === "IMPORTANT").length,
        MEDIUM_IMPORTANT: t.votes.filter(
          (v) => v.importance === "MEDIUM_IMPORTANT",
        ).length,
        LESS_IMPORTANT: t.votes.filter((v) => v.importance === "LESS_IMPORTANT")
          .length,
      },
    }));
  },

  async vote(userId: string, topicId: string, importance: TopicImportance) {
    await studyGroupRepository.upsertVote(userId, topicId, importance);
    return studyGroupRepository.getVoteCounts(topicId);
  },

  async removeVote(userId: string, topicId: string) {
    await studyGroupRepository.removeVote(userId, topicId);
    return studyGroupRepository.getVoteCounts(topicId);
  },
};
