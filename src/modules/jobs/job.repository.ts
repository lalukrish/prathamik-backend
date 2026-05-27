// import { prisma } from "../../config/db";

// export class JobRepository {
//   async create(data: any) {
//     return prisma.job.create({
//       data,
//     });
//   }

//   async findAll(
//     orgId: string | null,
//     skip: number,
//     limit: number,
//     search: string,
//   ) {
//     return prisma.job.findMany({
//       where: {
//         orgId,
//         ...(search && {
//           title: { contains: search, mode: "insensitive" },
//         }),
//       },
//       orderBy: { createdAt: "desc" },
//       include: {
//         creator: { select: { id: true, name: true } },
//         updater: { select: { id: true, name: true } },
//       },
//       skip,
//       take: limit,
//     });
//   }

//   async count(orgId: string | null, search: string) {
//     return prisma.job.count({
//       where: {
//         orgId,
//         ...(search && {
//           title: { contains: search, mode: "insensitive" },
//         }),
//       },
//     });
//   }
//   async findById(id: string, orgId: string | null) {
//     return prisma.job.findUnique({
//       where: { id, orgId },
//     });
//   }

//   async update(id: string, data: any) {
//     return prisma.job.update({
//       where: { id },
//       data,
//     });
//   }

//   async delete(id: string, orgId: string | null) {
//     return prisma.job.delete({
//       where: { id, orgId },
//     });
//   }
// }

import { prisma } from "../../config/db";

export class JobRepository {
  async create(data: any) {
    return prisma.job.create({
      data,
    });
  }

  async findAll(
    orgId: string | null,
    skip: number,
    limit: number,
    search: string,
  ) {
    // CHECK ORG ID
    if (!orgId) {
      throw new Error("Organization ID missing");
    }

    return prisma.job.findMany({
      where: {
        orgId,

        ...(search && {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },

        updater: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      skip,
      take: limit,
    });
  }

  async count(orgId: string | null, search: string) {
    // CHECK ORG ID
    if (!orgId) {
      throw new Error("Organization ID missing");
    }

    const baseWhere = {
      orgId,

      ...(search && {
        title: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
    };

    const [activeCount, disabledCount, totalCount] = await Promise.all([
      prisma.job.count({
        where: {
          ...baseWhere,
          disabled: false,
        },
      }),

      prisma.job.count({
        where: {
          ...baseWhere,
          disabled: true,
        },
      }),

      prisma.job.count({
        where: baseWhere,
      }),
    ]);

    return {
      activeCount,
      disabledCount,
      totalCount,
    };
  }

  async findById(id: string, orgId: string | null) {
    // CHECK ORG ID
    if (!orgId) {
      throw new Error("Organization ID missing");
    }

    return prisma.job.findFirst({
      where: {
        slug: id,
        orgId,
      },
    });
  }

  async findBySlug(slug: string, orgId: string | null) {
    // CHECK ORG ID
    if (!orgId) {
      throw new Error("Organization ID missing");
    }

    return prisma.job.findFirst({
      where: {
        slug: slug,
        orgId,
      },
    });
  }

  async update(id: string, data: any) {
    const job = await prisma.job.findFirst({
      where: {
        id,
      },
    });

    if (!job) {
      throw new Error("Job not found or disabled");
    }

    return prisma.job.update({
      where: {
        id,
      },

      data,
    });
  }

  async delete(id: string, orgId: string | null) {
    // CHECK ORG ID
    if (!orgId) {
      throw new Error("Organization ID missing");
    }

    // CHECK JOB EXISTS
    const job = await prisma.job.findFirst({
      where: {
        slug: id,
        orgId,
      },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    return prisma.job.update({
      where: {
        slug: id,
      },
      data: {
        disabled: !job.disabled,
      },
    });
  }

  // GET APPLIED CANDIDATES FOR PARTICULAR JOB

  async getAppliedCandidatesByJobId(
    jobId: string,
    skip: number,
    limit: number,
  ) {
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
  }

  async getJobNameAndId(orgId: string) {
    if (!orgId) {
      throw new Error("Organization ID missing");
    }
    return prisma.job.findMany({
      where: {
        orgId,
        disabled: false,
      },

      select: {
        id: true,
        title: true,
      },
    });
  }
}
