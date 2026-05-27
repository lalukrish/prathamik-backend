import { prisma } from "../../config/db";

import { ApplyJobDTO } from "./public.types";

import { uploadResumeToStorage }
  from "./resume.service";

import { applicationQueue }
  from "../applications/application.queue";

import { JobRepository } from "../jobs/job.repository";

const jobRepo = new JobRepository();
export class PublicService {
  async applyJob(
    jobId: string,
    payload: ApplyJobDTO,
    file?: Express.Multer.File,
  ) {
    // ============================================
    // Find Job
    // ============================================

    const job =
      await prisma.job.findUnique({
        where: {
          id: jobId,
        },
      });

    if (!job) {
      throw new Error(
        "Job not found",
      );
    }

    // ============================================
    // Find Existing Candidate
    // ============================================

    const existingCandidate =
      await prisma.candidate.findFirst({
        where: {
          email: payload.email,
        },
      });

    // ============================================
    // Prevent Duplicate Application
    // ============================================

    if (existingCandidate) {
      const existingApplication =
        await prisma.application.findFirst({
          where: {
            candidateId:
              existingCandidate.id,

            jobId,
          },
        });

      if (existingApplication) {
        throw new Error(
          "Already applied for this job",
        );
      }
    }

    // ============================================
    // Create Candidate
    // ============================================

    let candidate =
      existingCandidate;

    if (!candidate) {
      candidate =
        await prisma.candidate.create({
          data: {
            name:
              payload.name,

            email:
              payload.email,

            phone:
              payload.phone,

            // AI will populate later
            skills: [],

            totalExperience:
              payload.totalExperience
                ? parseFloat(
                  payload.totalExperience,
                )
                : null,

            expectedSalary:
              payload.expectedSalary ||
              null,

            currentCTC:
              payload.currentCTC ||
              null,

            noticePeriod:
              payload.noticePeriod ||
              null,

            isOnNoticePeriod:
              payload.isOnNoticePeriod ||
              false,

            orgId: job.orgId,
          },
        });
    }

    // ============================================
    // Upload Resume
    // ============================================

    let resumeId:
      | string
      | undefined;

    if (file) {
      const uploadedResume =
        await uploadResumeToStorage(
          file,
          candidate.id,
        );
      console.log("uploadedResume", uploadedResume);
      const resume = await prisma.resume.create({
        data: {
          candidateId: candidate.id,

          resumeUrl:
            uploadedResume.resumeUrl,

          storagePath:
            uploadedResume.storagePath,

          fileName: file.originalname,

          fileSize: file.size,

          mimeType: file.mimetype,
        },
      });

      resumeId = resume.id;
    }

    // ============================================
    // Create Application
    // ============================================

    const application =
      await prisma.application.create({
        data: {
          candidateId:
            candidate.id,

          jobId,

          resumeId,

          processingStatus:
            "QUEUED",
        },
      });

    // ============================================
    // Queue Resume Processing
    // ============================================

    await applicationQueue.add(
      "parse-resume",

      {
        applicationId:
          application.id,
      },

      {
        attempts: 3,

        backoff: {
          type: "exponential",

          delay: 5000,
        },

        removeOnComplete: true,

        removeOnFail: false,
      },
    );

    // ============================================
    // Return Response
    // ============================================

    return {
      candidate,

      application,
    };
  }

  async getJob(slug: string) {
    return jobRepo.findBySlugPublic(slug);
  }
}