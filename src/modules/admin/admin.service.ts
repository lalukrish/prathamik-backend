// admin.service.ts

import { prisma } from "../../config/db";

export const organizationService = {
  // CREATE ORGANIZATION
  async createOrganization(data: { name: string; createdById: string }) {
    // CHECK EXISTING ORGANIZATION
    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name: data.name,
        createdById: data.createdById,
      },
    });

    if (existingOrganization) {
      throw new Error("Organization already exists");
    }

    return prisma.organization.create({
      data: {
        name: data.name,
        createdById: data.createdById,
      },
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
