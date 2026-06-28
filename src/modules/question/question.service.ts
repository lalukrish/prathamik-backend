import { questionRepository } from "./question.repository";

export class QuestionService {
  async createQuestion(data: any) {
    const { mockTestId, question, type, options } = data;

    if (!mockTestId) {
      throw new Error("Mock Test ID is required");
    }

    if (!question?.trim()) {
      throw new Error("Question is required");
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      throw new Error("At least 2 options are required");
    }

    const correctAnswers = options.filter((option: any) => option.isCorrect);

    if (correctAnswers.length !== 1) {
      throw new Error("Exactly one correct answer is required");
    }

    return questionRepository.createQuestion({
      mockTestId,
      question,
      type,
      options,
    });
  }

  async getQuestionsByMockTest(mockTestId: string) {
    if (!mockTestId) {
      throw new Error("Mock Test ID is required");
    }

    return questionRepository.findByMockTestId(mockTestId);
  }

  async getQuestionById(id: string) {
    const question = await questionRepository.findById(id);

    if (!question) {
      throw new Error("Question not found");
    }

    return question;
  }

  async updateQuestion(id: string, data: any) {
    const existingQuestion = await questionRepository.findById(id);

    if (!existingQuestion) {
      throw new Error("Question not found");
    }

    if (data.options && Array.isArray(data.options)) {
      const correctAnswers = data.options.filter(
        (option: any) => option.isCorrect,
      );

      if (correctAnswers.length !== 1) {
        throw new Error("Exactly one correct answer is required");
      }
    }

    return questionRepository.updateQuestion(id, data);
  }

  async deleteQuestion(id: string) {
    const existingQuestion = await questionRepository.findById(id);

    if (!existingQuestion) {
      throw new Error("Question not found");
    }

    return questionRepository.deleteQuestion(id);
  }
}

export const questionService = new QuestionService();
