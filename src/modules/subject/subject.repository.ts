import { prisma } from "../../config/db";

export class SubjectRepository {
  async create(name: string) {
    return prisma.subject.create({
      data: {
        name,
      },
    });
  }

  async getAll() {
    return prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async getById(id: string) {
    return prisma.subject.findUnique({
      where: {
        id,
      },
    });
  }

  async delete(id: string) {
    return prisma.subject.delete({
      where: {
        id,
      },
    });
  }
}

export const subjectRepository = new SubjectRepository();
