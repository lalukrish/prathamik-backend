import DOMPurify from "isomorphic-dompurify";
import { extractTextFromHTML } from "../../utils/html";
import { EmbeddingService } from "../ai/embedding.service";
import { VectorService } from "../ai/vector.service";
import { JobRepository } from "./job.repository";
import { CreateJobDTO, UpdateJobDTO } from "./job.types";
import { generateUniqueSlug } from "../../utils/generateSlug";

const jobRepo = new JobRepository();

export class JobService {
  async createJob(data: CreateJobDTO, userId: string, orgId: string | null) {
    const cleanHtml = DOMPurify.sanitize(data.jdHtml);

    const description = extractTextFromHTML(cleanHtml);
    const slug = await generateUniqueSlug(data.title);
    console.log("data: job data", data);

    const job = await jobRepo.create({
      title: data.title,
      slug,
      jdHtml: cleanHtml,
      description,
      requiredSkills: data.requiredSkills,
      niceToHave: data.niceToHave,
      experienceMin: data.experienceMin,
      experienceMax: data.experienceMax,
      lastDate: data.lastDate,
      location: data.location,
      workMode: data.workMode,

      createdBy: userId,
      updatedBy: userId,
      orgId,
    });

    try {
      const text = `
        ${data.title}
        ${description}
        ${data.requiredSkills.join(", ")}
        ${data.niceToHave.join(", ")}
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

  async updateJob(id: string, data: UpdateJobDTO, userId: string) {
    let description: string | undefined;
    let cleanHtml: string | undefined;

    if (data.jdHtml) {
      cleanHtml = DOMPurify.sanitize(data.jdHtml);
      description = extractTextFromHTML(cleanHtml);
    }

    const updated = await jobRepo.update(id, {
      ...data,
      ...(cleanHtml && { jdHtml: cleanHtml }),
      ...(description && { description }),
      updatedBy: userId,
    });

    if (description) {
      try {
        const text = `
          ${updated.title}
          ${description}
          ${updated.requiredSkills.join(", ")}
          ${updated.niceToHave.join(", ")}
        `;

        const embeddingService = new EmbeddingService();
        const embedding = await embeddingService.generate(text);

        const vectorService = new VectorService();
        await vectorService.updateJobEmbedding(id, embedding);
      } catch (error) {
        console.error("Embedding update failed:", error);
      }
    }

    return updated;
  }

  async getJobs(orgId: string, page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      jobRepo.findAll(orgId, skip, limit, search),
      jobRepo.count(orgId, search),
    ]);

    return {
      data: jobs,
      meta: {
        total: total.totalCount,
        page,
        limit,
        totalPages: Math.ceil(total.totalCount / limit),
      },
    };
  }

  async getJob(id: string, orgId: string) {
    return jobRepo.findById(id, orgId);
  }

  async deleteJob(id: string, orgId: string | null) {
    return jobRepo.delete(id, orgId);
  }
  async getAppliedCandidates(jobId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    return jobRepo.getAppliedCandidatesByJobId(jobId, skip, limit);
  }

  async getJobNameAndId(orgId: string) {
    return jobRepo.getJobNameAndId(orgId);
  }
}
