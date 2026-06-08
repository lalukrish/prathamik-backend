import { findInterviewByToken } from './../interviews/interview.repository';
import { prisma } from "../../config/db";
import { ApplyJobDTO } from "./public.types";
import { uploadResumeToStorage } from "./resume.service";
import { applicationQueue } from "../applications/application.queue";
import { JobRepository } from "../jobs/job.repository";
import { PublicRepo } from "./public.repository";
import { SecurityEventType } from '@prisma/client';
import { interviewEvaluationQueue } from '../../queues/interview-evaluation.queue';

const jobRepo = new JobRepository();
const publicRepo = new PublicRepo()
export class PublicService {
  async applyJob(
    jobId: string,
    payload: ApplyJobDTO,
    file?: Express.Multer.File,
  ) {

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    const existingCandidate = await prisma.candidate.findFirst({
      where: {
        email: payload.email,
      },
    });

    if (existingCandidate) {
      const existingApplication = await prisma.application.findFirst({
        where: {
          candidateId: existingCandidate.id,
          jobId,
        },
      });

      if (existingApplication) {
        throw new Error("Already applied for this job");
      }
    }

    let candidate = existingCandidate;

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          skills: [],
          totalExperience: payload.totalExperience
            ? parseFloat(payload.totalExperience)
            : null,

          expectedSalary: payload.expectedSalary
            ? parseFloat(payload.expectedSalary)
            : null,

          currentCTC: payload.currentSalary
            ? parseFloat(payload.currentSalary)
            : null,

          noticePeriod: payload.noticePeriod
            ? parseFloat(payload.noticePeriod)
            : null,

          isOnNoticePeriod:
            payload.isOnNoticePeriod === "true" ||
            payload.isOnNoticePeriod === true,

          orgId: job.orgId,
        },
      });
    }

    let resumeId: string | undefined;

    if (file) {
      const uploadedResume = await uploadResumeToStorage(file, candidate.id);
      const resume = await prisma.resume.create({
        data: {
          candidateId: candidate.id,

          resumeUrl: uploadedResume.resumeUrl,

          storagePath: uploadedResume.storagePath,

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

    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,

        jobId,

        resumeId,

        processingStatus: "QUEUED",
      },
    });

    // ============================================
    // Queue Resume Processing
    // ============================================

    await applicationQueue.add(
      "parse-resume",

      {
        applicationId: application.id,
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

  async validateInterviewToken(token: string) {
    const interview = await publicRepo.validateInterviewToken(token)
    return interview;
  }

  async cancelInterview(token: string, reason: string) {
    const candidateId = await publicRepo.canidateIdByToken(token)
    const interview = await publicRepo.cancelInterview(candidateId, token, reason)
    return interview;
  }

  async startInterview(token: string) {
    const interview = await publicRepo.findInterviewByToken(token);

    if (!interview) {
      throw new Error("Interview not found");
    }
    if (interview.status !== "SCHEDULED") {
      throw new Error("Interview cannot be started");
    }

    if (
      interview.scheduledEndAt &&
      interview.scheduledEndAt < new Date()
    ) {
      throw new Error("Interview link expired");
    }

    return publicRepo.startInterview(interview.id);
  };


  async getInterviewQuestion(token: string) {
    const interview =
      await publicRepo.findInterviewByToken(
        token
      );

    if (!interview) {
      throw new Error(
        "Interview not found",
      );
    }
    if (
      interview.status !== "IN_PROGRESS"
    ) {
      throw new Error(
        "Interview has not started",
      );
    }

    const question =
      await publicRepo.getNextQuestion(
        interview.id
      );

    if (!question) {
      return {
        completed: true,
      };
    }

    return {
      completed: false,
      question,
    };
  };

  async submitInterviewAnswer({
    token,
    questionId,
    answer,
  }: {
    token: string;
    questionId: string;
    answer: string;
  }) {
    const interview =
      await publicRepo.findInterviewByToken(
        token
      );

    if (!interview) {
      throw new Error(
        "Interview not found",
      );
    }

    if (
      interview.status !== "IN_PROGRESS"
    ) {
      throw new Error(
        "Interview is not active",
      );
    }

    const question =
      await publicRepo.findInterviewQuestion(
        interview.id,
        questionId
      );

    if (!question) {
      throw new Error(
        "Question not found",
      );
    }

    const existingAnswer =
      await publicRepo.findAnswer(
        interview.id,
        questionId
      );

    if (existingAnswer) {
      throw new Error(
        "Question already answered",
      );
    }

    return publicRepo.saveAnswer(
      interview.id,
      questionId,
      answer
    );
  };

  async logSecurityEvent({
    token,
    type,
    metadata,
  }: {
    token: string;
    type: SecurityEventType;
    metadata?: any;
  }) {
    const interview =
      await publicRepo.findInterviewByToken(
        token
      );

    if (!interview) {
      throw new Error(
        "Interview not found",
      );
    }

    if (
      interview.status !== "IN_PROGRESS"
    ) {
      throw new Error(
        "Interview is not active",
      );
    }

    return publicRepo.createSecurityEvent({
      interviewId: interview.id,
      type,
      metadata,
    });
  }

  async completeInterview(id: string) {
    const interview =
      await publicRepo.findInterviewById(id);

    if (!interview) {
      throw new Error(
        "Interview not found",
      );
    }

    if (
      interview.status !== "IN_PROGRESS"
    ) {
      throw new Error(
        "Interview is not active",
      );
    }

    const securityEvents =
      await publicRepo.getSecuritySummary(
        id
      );

    let suspicionScore = 0;

    securityEvents.forEach((event) => {
      const count = event._count;

      switch (event.type) {
        case "TAB_SWITCH":
          suspicionScore += count * 2;
          break;

        case "WINDOW_BLUR":
          suspicionScore += count * 2;
          break;

        case "WINDOW_MINIMIZE":
          suspicionScore += count * 5;
          break;

        case "FULLSCREEN_EXIT":
          suspicionScore += count * 8;
          break;

        case "COPY_PASTE":
          suspicionScore += count * 15;
          break;

        case "RIGHT_CLICK":
          suspicionScore += count * 3;
          break;

        case "MULTIPLE_MONITORS":
          suspicionScore += count * 20;
          break;

        case "DEVTOOLS_OPEN":
          suspicionScore += count * 25;
          break;

        case "NETWORK_DISCONNECT":
          suspicionScore += count * 2;
          break;

        case "LONG_INACTIVITY":
          suspicionScore += count * 10;
          break;

        case "MULTIPLE_FACES":
          suspicionScore += count * 30;
          break;

        case "VOICE_MISMATCH":
          suspicionScore += count * 40;
          break;

        case "RAPID_ANSWERING":
          suspicionScore += count * 10;
          break;

        case "SUSPICIOUS_TYPING":
          suspicionScore += count * 15;
          break;

        default:
          break;
      }
    });

    const result =
      await publicRepo.completeInterview(
        id,
        suspicionScore
      );

    await publicRepo.interviewActivityCandidate(
      id,
      interview.application.candidateId,
    );

    await interviewEvaluationQueue.add(
      "evaluate-interview",
      {
        interviewId: id,
      }
    );

    return result;
  }
}
