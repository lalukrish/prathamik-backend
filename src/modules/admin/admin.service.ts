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
  // GET ORGANIZATIONS OF PARTICULAR SUPER ADMIN
  async getAllOrganizations(createdById: string) {
    return prisma.organization.findMany({
      where: {
        createdById,
      },

      select: {
        id: true,
        name: true,
        createdAt: true,
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
