import { prisma } from "../../config/db";
import { Role } from "@prisma/client";

export const userRepository = {
  findByUserId: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        organization: { select: { name: true } },
      },
    });
  },
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  createUser: async (data: any) => {
    return prisma.user.create({
      data,

      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },

        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
  updateUserInActive(id: string, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: {
        isActive,
      },
    });
  },
  findAllUser: async (
    skip: number,
    limit: number,
    isActive?: boolean,
    role?: string,
  ) => {
    return prisma.user.findMany({
      where: {
        ...(isActive !== undefined && { isActive }),
        ...(role && { role: role as Role }),
      },

      skip,
      take: limit,

      include: {
        organization: {
          select: {
            id: true,
            name: true,
            // branch_name: true,
            createdAt: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  count: async (isActive?: boolean, role?: string) => {
    return prisma.user.count({
      where: {
        ...(isActive !== undefined && { isActive }),

        ...(role && { role: role as Role }),
      },
    });
  },
  findOrganizationById: async (orgId: string) => {
    return prisma.organization.findUnique({
      where: {
        id: orgId,
      },
    });
  },
  findBranchById: async (branchId: string) => {
    return prisma.branch.findUnique({
      where: {
        id: branchId,
      },
    });
  },
};
