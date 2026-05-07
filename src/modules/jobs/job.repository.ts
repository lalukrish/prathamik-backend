import { prisma } from "../../config/db";

export class JobRepository {
  async create(data: any) {
    return prisma.job.create({
      data,
    });
  }

<<<<<<< HEAD
    async findAll(orgId: string, skip: number, limit: number) {
        return prisma.job.findMany({
            where: { orgId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
    }

    async count(orgId: string) {
        return prisma.job.count({
            where: { orgId },
        });
    }
    async findById(id: string, orgId: string) {
        return prisma.job.findUnique({
            where: { id, orgId },
        });
    }
=======
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
>>>>>>> 9c5a64070ae11a5aa41105734b24d020831c29b9

  async update(id: string, data: any) {
    return prisma.job.update({
      where: { id },
      data,
    });
  }

<<<<<<< HEAD
    async delete(id: string, orgId: string) {
        return prisma.job.delete({
            where: { id, orgId },
        });
    }
}
=======
  async delete(id: string) {
    return prisma.job.delete({
      where: { id },
    });
  }
}
>>>>>>> 9c5a64070ae11a5aa41105734b24d020831c29b9
