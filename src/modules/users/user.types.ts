import { z } from "zod";
import { createUserSchema, updateUserSchema } from "./user.validator";

export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
