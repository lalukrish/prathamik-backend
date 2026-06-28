import { prisma } from "../../config/db";

export class QuestionRepository {
  async createQuestion(data: any) {
    return prisma.question.create({
      data: {
        mockTestId: data.mockTestId,
        question: data.question,
        type: data.type,

        options: {
          create: data.options,
        },
      },
      include: {
        options: true,
      },
    });
  }

  async findByMockTestId(mockTestId: string) {
    return prisma.question.findMany({
      where: {
        mockTestId,
      },
      include: {
        options: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findById(id: string) {
    return prisma.question.findUnique({
      where: {
        id,
      },
      include: {
        options: true,
      },
    });
  }

  async updateQuestion(id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      // Update question
      await tx.question.update({
        where: { id },
        data: {
          question: data.question,
          type: data.type,
        },
      });

      // Replace options if provided
      if (data.options) {
        await tx.option.deleteMany({
          where: {
            questionId: id,
          },
        });

        await tx.option.createMany({
          data: data.options.map((option: any) => ({
            questionId: id,
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        });
      }

      return tx.question.findUnique({
        where: { id },
        include: {
          options: true,
        },
      });
    });
  }

  async deleteQuestion(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.option.deleteMany({
        where: {
          questionId: id,
        },
      });

      return tx.question.delete({
        where: {
          id,
        },
      });
    });
  }
}

export const questionRepository = new QuestionRepository();
