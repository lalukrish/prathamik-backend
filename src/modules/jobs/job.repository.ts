import { prisma } from "../../config/db";

export class JobRepository {
  async create(data: any) {
    return prisma.job.create({
      data,
    });
  }

  async findAll(orgId: string, skip: number, limit: number, search: string) {
    return prisma.job.findMany({
      where: {
        orgId,
        ...(search && {
          title: { contains: search, mode: "insensitive" },
        }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { id: true, name: true } },
        updater: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
    });
  }

  async count(orgId: string, search: string) {
    return prisma.job.count({
      where: {
        orgId,
        ...(search && {
          title: { contains: search, mode: "insensitive" },
        }),
      },
    });
  }
  async findById(id: string, orgId: string) {
    return prisma.job.findUnique({
      where: { id, orgId },
    });
  }

  async update(id: string, data: any) {
    return prisma.job.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, orgId: string) {
    return prisma.job.delete({
      where: { id, orgId },
    });
  }
}
