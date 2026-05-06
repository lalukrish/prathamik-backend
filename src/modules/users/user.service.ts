import { userRepository } from "./user.repository";

export const userService = {
  getUserByEmail: async (email: string) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
};
