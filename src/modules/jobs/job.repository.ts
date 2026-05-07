import { prisma } from "../../config/db";

export class JobRepository {
    async create(data: any) {
        return prisma.job.create({
            data,
        });
    }

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