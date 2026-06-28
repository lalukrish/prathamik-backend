import { prisma } from "../../config/db";

export class QuestionRepository {
  async create(data: any) {
    return prisma.question.create({
      data: {
        mockTestId: data.mockTestId,
        subjectId: data.subjectId,
        question: data.question,
        description: data.description,
        type: data.type,
        marks: data.marks ?? 1,
        negativeMarks: data.negativeMarks ?? 0,
        sortOrder: data.sortOrder ?? 0,
        difficulty: data.difficulty ?? "MEDIUM",

        options: {
          create: data.options,
        },
      },
      include: {
        options: true,
        subject: true,
      },
    });
  }

  async getByMockTestId(mockTestId: string) {
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

  async delete(id: string) {
    return prisma.question.delete({
      where: {
        id,
      },
    });
  }
}

export const questionRepository = new QuestionRepository();
