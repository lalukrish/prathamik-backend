import { JobRepository } from "./job.repository";
import { prisma } from "../../config/db";
import { EmbeddingService } from "../ai/embedding.service";
import { VectorService } from "../ai/vector.service";

const jobRepo = new JobRepository();

export class JobService {
<<<<<<< HEAD
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
=======
  async createJob(data: any, userId: string, orgId: string) {
    const job = await jobRepo.create({
      ...data,
      createdBy: userId,
      orgId,
    });

    const embedding = new Array(1536).fill(0);
    const vector = `[${embedding.join(",")}]`;
    await prisma.$executeRawUnsafe(
      `UPDATE "Job"
     SET embedding = $1::vector
     WHERE id = $2`,
      vector,
      job.id,
    );
>>>>>>> 9c5a64070ae11a5aa41105734b24d020831c29b9

    return job;
  }

<<<<<<< HEAD
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
=======
  async getJobs(orgId: string) {
    return jobRepo.findAll(orgId);
  }

  async getJob(id: string) {
    return jobRepo.findById(id);
  }
>>>>>>> 9c5a64070ae11a5aa41105734b24d020831c29b9

  async updateJob(id: string, data: any, userId: string) {
    return jobRepo.update(id, {
      ...data,
      updatedBy: userId,
    });
  }

<<<<<<< HEAD
    async deleteJob(id: string, orgId: string) {
        return jobRepo.delete(id, orgId);
    }
}
=======
  async deleteJob(id: string) {
    return jobRepo.delete(id);
  }
}
>>>>>>> 9c5a64070ae11a5aa41105734b24d020831c29b9
