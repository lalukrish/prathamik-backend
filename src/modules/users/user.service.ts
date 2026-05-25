import { userRepository } from "./user.repository";
import { CreateUserInput, UpdateUserInput } from "./user.types";
import bcrypt from "bcrypt";

export const userService = {
  getUserById: async (id: string) => {
    const user = await userRepository.findByUserId(id);

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
  createUser: async (data: CreateUserInput) => {
    const existing = await userRepository.findByEmail(data.email);

    if (existing) {
      throw new Error("User already exists");
    }

    if (data.role === "recruiter" || data.role === "hr_manager") {
      if (!data.orgId) {
        throw new Error("Organization is required");
      }

      if (!data.branchId) {
        throw new Error("Branch is required");
      }

      const organization = await userRepository.findOrganizationById(
        data.orgId,
      );

      if (!organization) {
        throw new Error("Organization not found");
      }

      const branch = await userRepository.findBranchById(data.branchId);

      if (!branch) {
        throw new Error("Branch not found");
      }

      if (branch.organizationId !== data.orgId) {
        throw new Error("Selected branch does not belong to organization");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return userRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,

      orgId: data.orgId || null,

      branchId: data.branchId || null,

      isActive: data.isActive ?? true,
    });
  },
  updateUser: async (id: string, data: UpdateUserInput) => {
    const existing = await userRepository.findByUserId(id);

    if (!existing) {
      throw new Error("User doesn't exists");
    }

    const user = await userRepository.updateUser(id, {
      ...data,
    });

    return user;
  },
  deleteSoft: async (id: string, isActive: boolean) => {
    const existing = await userRepository.findByUserId(id);
    if (!existing) {
      throw new Error("User doesn't exists");
    }
    const user = await userRepository.updateUserInActive(id, isActive);
    return user;
  },

  getAllUsers: async (
    page: number,
    limit: number,
    isActive?: boolean,
    role?: string,
  ) => {
    const skip = (page - 1) * limit;

    const [users, filteredTotal, total] = await Promise.all([
      userRepository.findAllUser(skip, limit, isActive, role),

      userRepository.count(isActive, role),

      userRepository.count(),
    ]);

    return {
      data: users,

      meta: {
        filteredTotal,
        total,

        page,
        limit,

        totalPages: Math.ceil(filteredTotal / limit),
      },
    };
  },
};
