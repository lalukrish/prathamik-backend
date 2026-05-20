import { prisma } from "../../config/db";

export const organizationService = {
  createOrganization: async (data: any, userId: string) => {
    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name: data.name,
        branch_name: data.branch_name,
        createdById: data.createdById,
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
};
