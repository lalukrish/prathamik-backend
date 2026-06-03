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
      select: {
        id: true,
        title: true,
        disabled: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
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

  async findBySlugPublic(slug: string) {
    return prisma.job.findFirst({
      where: {
        slug: slug,
        disabled: false,
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
    if (!orgId) {
      throw new Error("Organization ID missing");
    }

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

  async getAppliedCandidatesByJobId(
    jobId: string,
    skip: number,
    limit: number,
    orgId: string,
  ) {
    return prisma.application.findMany({
      where: {
        candidate: {
          orgId
        },
        jobId,
      },

      select: {
        id: true,
        status: true,
        createdAt: true,

        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            currentRole: true,
            totalExperience: true,
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

  async countApplicationsByJobId(orgId: string) {
    if (!orgId) {
      throw new Error("Organization ID missing");
    }
    return prisma.application.count({
      where: {
        candidate: {
          orgId
        },
      },
    });
  }
}
