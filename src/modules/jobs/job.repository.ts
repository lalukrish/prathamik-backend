import { prisma } from "../../config/db";

export class JobRepository {
  async create(data: any) {
    return prisma.job.create({
      data,
    });
  }

  async findAll(orgId: string) {
    return prisma.job.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    return prisma.job.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.job.delete({
      where: { id },
    });
  }
}
