import { userRepository } from "./user.repository";
import { UserData } from "./user.types";
import bcrypt from "bcrypt";

export const userService = {
  getUserById: async (id: string) => {
    const user = await userRepository.findByUserId(id);

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
  createUser: async (data: UserData) => {
    const existing = await userRepository.findByUserId(data.email);

    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    return user;
  },
};
