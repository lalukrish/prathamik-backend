import { prisma } from "../../config/db";

export const organizationService = {
  createOrganization: async (data: any) => {
    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name: data.name,
        branch_name: data.branch_name,
      },
    });

    if (existingOrganization) {
      throw new Error("Organization with this branch already exists");
    }

    return prisma.organization.create({
      data: {
        name: data.name,
        branch_name: data.branch_name,
        createdById: data.createdById,
      },
    });
  },
  async getAllOrganizations() {
    return prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        branch_name: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  },
};
