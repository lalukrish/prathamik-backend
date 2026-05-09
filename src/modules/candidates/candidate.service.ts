import { candidateRepository } from "./candidate.repository";
import { CreateUserInput, UpdateUserInput } from "./user.types";

export const candidateService = {
  getCandidateById: async (id: string) => {
    const user = await candidateRepository.findByUserId(id);

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
  getAllCandidate: async (page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      candidateRepository.findAllCandidate(skip, limit),

      candidateRepository.count(),
    ]);

    return {
      data: users,

      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
