import { JobRepository } from "./job.repository";
import { prisma } from "../../config/db";

const jobRepo = new JobRepository();

export class JobService {
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

    return job;
  }

  async getJobs(orgId: string) {
    return jobRepo.findAll(orgId);
  }

  async getJob(id: string) {
    return jobRepo.findById(id);
  }

  async updateJob(id: string, data: any, userId: string) {
    return jobRepo.update(id, {
      ...data,
      updatedBy: userId,
    });
  }

  async deleteJob(id: string) {
    return jobRepo.delete(id);
  }
}
