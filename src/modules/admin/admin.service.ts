import { prisma } from "../../config/db";
import bcrypt from "bcrypt";

export const organizationService = {
  async createOrganizationWithAdmin(data: {
    organizationName: string;

    adminName: string;
    adminEmail: string;
    adminPassword: string;

    createdById: string;
  }) {
    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name: data.organizationName,
      },
    });

    if (existingOrganization) {
      throw new Error("Organization already exists");
    }

    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: data.adminEmail,
      },
    });

    if (existingAdmin) {
      throw new Error("Admin email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    return prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          createdById: data.createdById,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          password: hashedPassword,
          role: "admin",
          orgId: organization.id,
        },
      });

      return {
        organization,
        admin: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      };
    });
  },

  async updateOrganizationWithAdmin(
    organizationId: string,
    data: {
      organizationName: string;

      adminId: string;
      adminName: string;
      adminEmail: string;
      adminPassword?: string;
    },
  ) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: data.adminId,
      },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    // CHECK EMAIL DUPLICATE
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: data.adminEmail,
        NOT: {
          id: data.adminId,
        },
      },
    });

    if (existingEmail) {
      throw new Error("Email already in use");
    }

    return prisma.$transaction(async (tx) => {
      // UPDATE ORGANIZATION
      const updatedOrganization = await tx.organization.update({
        where: {
          id: organizationId,
        },

        data: {
          name: data.organizationName,
        },
      });

      // UPDATE ADMIN
      const updatedAdmin = await tx.user.update({
        where: {
          id: data.adminId,
        },

        data: {
          name: data.adminName,
          email: data.adminEmail,

          ...(data.adminPassword && {
            password: await bcrypt.hash(data.adminPassword, 10),
          }),
        },
      });

      return {
        organization: updatedOrganization,

        admin: {
          id: updatedAdmin.id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          role: updatedAdmin.role,
        },
      };
    });
  },

  // GET ORGANIZATIONS OF PARTICULAR SUPER ADMIN
  async getAllOrganizations(
    createdById: string,
    page: number,
    limit: number,
    search: string,
  ) {
    const skip = (page - 1) * limit;

    return prisma.organization.findMany({
      where: {
        createdById,

        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            users: {
              some: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            users: {
              some: {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },

      skip,
      take: limit,

      select: {
        id: true,
        name: true,
        createdAt: true,

        users: {
          where: {
            role: "admin",
          },

          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // CREATE BRANCH
  async createBranch(data: { name: string; organizationId: string }) {
    // CHECK EXISTING BRANCH
    const existingBranch = await prisma.branch.findFirst({
      where: {
        name: data.name,
        organizationId: data.organizationId,
      },
    });

    if (existingBranch) {
      throw new Error("Branch already exists in this organization");
    }

    return prisma.branch.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
      },
    });
  },

  // GET BRANCHES OF ORGANIZATION
  async getBranches(organizationId: string) {
    return prisma.branch.findMany({
      where: {
        organizationId,
      },

      select: {
        id: true,
        name: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  },
};
