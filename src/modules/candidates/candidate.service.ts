import { candidateRepository } from "./candidate.repository";
import { uploadResumeToStorage } from "../public/resume.service";
import { ApplyJobDTO } from "../public/public.types";

export const candidateService = {
  getCandidateById: async (id: string) => {
    const user = await candidateRepository.findByUserId(id);

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  getAllCandidate: async (page: number, limit: number, isBlocked?: boolean) => {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      candidateRepository.findAllCandidate(skip, limit, isBlocked),
      candidateRepository.count(isBlocked),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  candidateApplyJob: async (
    jobId: string,
    userId: string,
    payload: ApplyJobDTO,
    file?: Express.Multer.File,
  ) => {
    const job = await candidateRepository.findJobById(jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    const existingCandidate = await candidateRepository.findCandidateByEmail(
      payload.email,
    );

    if (existingCandidate) {
      const existingApplication =
        await candidateRepository.findExistingApplication(
          existingCandidate.id,
          jobId,
        );

      if (existingApplication) {
        throw new Error("Already applied for this job");
      }
    }

    let candidate = existingCandidate;

    if (!candidate) {
      candidate = await candidateRepository.createCandidate(
        payload,
        job.orgId,
        userId,
      );
    }

    let resumeId: string | undefined;

    if (file) {
      const resumeUrl = await uploadResumeToStorage(file, candidate.id);

      const resume = await candidateRepository.createResume(
        candidate.id,
        resumeUrl,
        file,
      );

      resumeId = resume.id;
    }

    const application = await candidateRepository.createApplication(
      candidate.id,
      jobId,
      resumeId,
    );

    return {
      candidate,
      application,
    };
  },

  candidateUpdateProfile: async (
    userId: string,
    payload: ApplyJobDTO,
    file?: Express.Multer.File,
  ) => {
    const candidate = await candidateRepository.findByUserId(userId);

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const updatedCandidate = await candidateRepository.updateCandidate(
      candidate.id,
      payload,
    );

    let resume = null;

    if (file) {
      const resumeUrl = await uploadResumeToStorage(file, candidate.id);

      const existingResume = await candidateRepository.findResumeByCandidateId(
        candidate.id,
      );

      if (existingResume) {
        resume = await candidateRepository.updateResume(
          existingResume.id,
          resumeUrl,
          file,
        );
      } else {
        resume = await candidateRepository.createResume(
          candidate.id,
          resumeUrl,
          file,
        );
      }
    }

    return {
      candidate: updatedCandidate,
      resume,
    };
  },
  candidateSoftDelete: async (id: string, isBlocked: boolean) => {
    const existing = await candidateRepository.findByUserId(id);
    if (!existing) {
      throw new Error("User doesn't exists");
    }
    const candidate = await candidateRepository.updateCandidateInActive(
      id,
      isBlocked,
    );
    return candidate;
  },
};
