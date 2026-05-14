import { prisma } from "../../config/db";

export const candidateRepository = {
  findByUserId: async (id: string) => {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        resumes: true,

        applications: {
          include: {
            job: true,
            scores: true,
          },
        },
      },
    });
  },

  getCandidateHistory: async (id: string) => {
    return prisma.candidate.findFirst({
      where: {
        id,
      },

      include: {
        resumes: true,

        applications: {
          include: {
            job: true,
          },
        },
      },
    });
  },
  findByEmail: async (email: string) => {
    return prisma.candidate.findFirst({
      where: { email },
    });
  },

  findAllCandidate: async (skip: number, limit: number, isBlocked: boolean) => {
    return prisma.candidate.findMany({
      where: isBlocked !== undefined ? { isBlocked } : {},

      skip,
      take: limit,
    });
  },

  count: async (isActive?: boolean) => {
    return prisma.candidate.count({});
  },

  findJobById: async (jobId: string) => {
    return prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });
  },

  findCandidateByEmail: async (email: string) => {
    return prisma.candidate.findFirst({
      where: {
        email,
      },
    });
  },

  findExistingApplication: async (candidateId: string, jobId: string) => {
    return prisma.application.findFirst({
      where: {
        candidateId,
        jobId,
      },
    });
  },

  createCandidate: async (payload: any, orgId: string, userId: string) => {
    return prisma.candidate.create({
      data: {
        name: payload.name,

        email: payload.email,

        phone: payload.phone,

        currentRole: payload.currentRole,

        totalExperience: payload.totalExperience,

        skills: payload.skills || [],

        expectedSalary: payload.expectedSalary,

        currentCTC: payload.currentCTC,

        noticePeriod: payload.noticePeriod,

        isOnNoticePeriod: payload.isOnNoticePeriod,

        linkedinUrl: payload.linkedinUrl,

        orgId,
        createdBy: userId,
      },
    });
  },

  createResume: async (
    candidateId: string,
    resumeUrl: string,
    file: Express.Multer.File,
  ) => {
    return prisma.resume.create({
      data: {
        candidateId,

        resumeUrl,

        fileName: file.originalname,

        fileSize: file.size,

        mimeType: file.mimetype,
      },
    });
  },

  createApplication: async (
    candidateId: string,
    jobId: string,
    resumeId?: string,
  ) => {
    return prisma.application.create({
      data: {
        candidateId,

        jobId,

        resumeId,
      },
    });
  },

  updateCandidate: async (candidateId: string, payload: any) => {
    return prisma.candidate.update({
      where: {
        id: candidateId,
      },

      data: {
        name: payload.name,

        email: payload.email,

        phone: payload.phone,

        currentRole: payload.currentRole,

        totalExperience: payload.totalExperience,

        skills: payload.skills || [],

        expectedSalary: payload.expectedSalary,

        currentCTC: payload.currentCTC,

        noticePeriod: payload.noticePeriod,

        isOnNoticePeriod: payload.isOnNoticePeriod,

        linkedinUrl: payload.linkedinUrl,
      },
    });
  },

  findResumeByCandidateId: async (candidateId: string) => {
    return prisma.resume.findFirst({
      where: {
        candidateId,
      },
    });
  },

  updateResume: async (
    resumeId: string,
    resumeUrl: string,
    file: Express.Multer.File,
  ) => {
    return prisma.resume.update({
      where: {
        id: resumeId,
      },

      data: {
        resumeUrl,

        fileName: file.originalname,

        fileSize: file.size,

        mimeType: file.mimetype,
      },
    });
  },

  updateCandidateInActive(id: string, isBlocked: boolean) {
    return prisma.candidate.update({
      where: { id },
      data: {
        isBlocked,
      },
    });
  },
};
