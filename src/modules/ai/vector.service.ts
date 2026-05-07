import { prisma } from "../../config/db";


export class VectorService {
    async updateJobEmbedding(jobId: string, embedding: number[]) {
        const vector = `[${embedding.join(",")}]`;

        await prisma.$executeRawUnsafe(
            `UPDATE "Job"
     SET embedding = $1::vector
     WHERE id = $2`,
            vector,
            jobId
        );
    }
}