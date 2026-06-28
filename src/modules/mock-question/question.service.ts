import { questionRepository } from "./question.repository";

export class QuestionService {
  async createQuestion(data: any) {
    if (!data.question?.trim()) {
      throw new Error("Question is required");
    }

    if (!data.mockTestId) {
      throw new Error("Mock Test ID is required");
    }

    if (!data.options?.length) {
      throw new Error("At least one option is required");
    }

    const correctAnswer = data.options.filter(
      (option: any) => option.isCorrect,
    );

    if (correctAnswer.length !== 1) {
      throw new Error("Exactly one correct answer required");
    }

    return questionRepository.create(data);
  }

  async getQuestions(mockTestId: string) {
    return questionRepository.getByMockTestId(mockTestId);
  }

  async deleteQuestion(id: string) {
    return questionRepository.delete(id);
  }
}

export const questionService = new QuestionService();
