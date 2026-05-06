import { JobRepository } from "./job.repository";
import { prisma } from "../../config/db";
import { EmbeddingService } from "../ai/embedding.service";
import { VectorService } from "../ai/vector.service";

const jobRepo = new JobRepository();

export class JobService {
    async createJob(data: any, userId: string, orgId: string) {
        const job = await jobRepo.create({
            ...data,
            createdBy: userId,
            updatedBy: userId,
            orgId,
        });

        try {
            const text = `
      ${data.title}
      ${data.description}
      ${data.requiredSkills?.join(", ") || ""}
      ${data.niceToHave?.join(", ") || ""}
    `;
            const embeddingService = new EmbeddingService();
            const embedding = await embeddingService.generate(text);
            const vectorService = new VectorService();
            await vectorService.updateJobEmbedding(job.id, embedding);
        } catch (error) {
            console.error("Embedding failed:", error);
        }

        return job;
    }

    async getJobs(orgId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            jobRepo.findAll(orgId, skip, limit),
            jobRepo.count(orgId),
        ]);

        return {
            data: jobs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getJob(id: string, orgId: string) {
        return jobRepo.findById(id, orgId);
    }

    async updateJob(id: string, data: any, userId: string) {
        return jobRepo.update(id, {
            ...data,
            updatedBy: userId,
        });
    }

    async deleteJob(id: string, orgId: string) {
        return jobRepo.delete(id, orgId);
    }
}