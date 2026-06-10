import { CandidateScore } from './../../../node_modules/.prisma/client/index.d';
import { includes } from 'zod';
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

  findApplicationCandidate: async (id: string) => {
    return prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        jobId: true,
        status: true,
        overallScore: true,
        createdAt: true,
        parsedData: true,
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            currentRole: true,
            totalExperience: true,
            skills: true,
            expectedSalary: true,
            currentCTC: true,
            noticePeriod: true,
            isOnNoticePeriod: true,
            linkedinUrl: true,
            parsedData: true,
          },
        },

        interviews: {
          select: {
            id: true,
            status: true,
            accessToken: true,
            scheduledStartAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        scores: {
          select: {
            resumeScore: true
          }
        }
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

  findAllCandidate: async (
    skip: number,
    limit: number,
    isBlocked?: boolean,
  ) => {
    return prisma.candidate.findMany({
      where: isBlocked !== undefined ? { isBlocked } : {},
      include: {
        applications: {
          select: {
            id: true,
            jobId: true,
            candidateId: true,
            candidate: true,
            resumeId: true,
            job: true,
            matchedSkills: true,
            missingSkills: true,
            overallScore: true,
            scores: true,
            status: true,
            resume: true,
            createdAt: true,
            updatedAt: true,
          },
          include: {
            interviews: {
              select: {
                id: true,
                status: true
              },
              orderBy: {
                createdAt: "desc"
              },
              take: 1
            }
          }
        },
      },
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
  }, // GET APPLIED CANDIDATES FOR PARTICULAR JOB

  getAppliedCandidatesByJobId: async (
    jobId: string,
    skip: number,
    limit: number,
  ) => {
    return prisma.application.findMany({
      where: {
        jobId,
      },

      select: {
        id: true,
        status: true,
        overallScore: true,
        matchedSkills: true,
        missingSkills: true,
        createdAt: true,

        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            currentRole: true,
            totalExperience: true,
            skills: true,
            linkedinUrl: true,
            createdAt: true,
          },
        },

        resume: {
          select: {
            id: true,
            resumeUrl: true,
            fileName: true,
          },
        },
      },

      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getCandidateParsedData: async (id: string, orgId: string) => {
    return prisma.application.findFirst({
      where: {
        id,
        candidate: {
          orgId,
        },
      },
      select: {
        id: true,
        status: true,
        overallScore: true,
        matchedSkills: true,
        missingSkills: true,
        createdAt: true,
        aiSummary: true,
        parsedData: true,

        candidate: {
          select: {
            orgId: true,
          },
        },

        resume: {
          select: {
            id: true,
            resumeUrl: true,
            fileName: true,
          },
        },
      },
    });
  },

  getInterviewHistory: async (applicationId: string) => {
    return prisma.interview.findMany({
      where: {
        applicationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        durationMinutes: true,
        status: true,
        scheduledStartAt: true,
        scheduledEndAt: true,
        totalQuestions: true,
        totalScore: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,

        answers: {
          select: {
            id: true,
            answerText: true,
            score: true,
            durationSeconds: true,

            question: {
              select: {
                id: true,
                question: true,
                maxScore: true,
                timeLimitSeconds: true,
                type: true,
                difficulty: true,
              },
            },
          },
        },

        questionBank: {
          select: {
            id: true,
            title: true,
          },
        },

        application: {
          select: {
            scores: true
          },
        },

        securityEvents: {
          select: {
            id: true,
            type: true,
            severity: true,
            metadata: true,
            createdAt: true,
          },
        },
      },
    });
  },
};
