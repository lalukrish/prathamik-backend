import { prisma } from "../../config/db";

export class ApplicationRepository {

    async findById(id: string, orgId: string) {
        return prisma.application.findFirst({
            where: {
                id,
                candidate: {
                    orgId,
                },
            },
            include: {
                candidate: true,
            },
        });
    }

    async updateStatus(
        applicationId: string,
        status: string,
        updatedBy: string
    ) {
        return prisma.application.update({
            where: { id: applicationId },
            data: {
                status,
                updatedAt: new Date(),
            },
        });
    }
}

export default new ApplicationRepository();