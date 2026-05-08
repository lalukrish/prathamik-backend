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
    const existing = await userRepository.findByEmail(data.body.email);

    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.body.password, 10);
    const user = await userRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    return user;
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

  getAllUsers: async (page: number, limit: number, isActive?: boolean) => {
    const skip = (page - 1) * limit;

    const [users, filteredTotal, total] = await Promise.all([
      userRepository.findAllUser(skip, limit, isActive),

      userRepository.count(isActive),

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
