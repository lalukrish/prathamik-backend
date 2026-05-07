import { Role, Organization, Session } from "@prisma/client";

import { z } from "zod";
import { createUserSchema } from "./user.validator";

export type CreateUserInput = z.infer<typeof createUserSchema>;

export interface UpdateUser {
  title?: string;
  description?: string;

  requiredSkills?: string[];
  niceToHave?: string[];

  experienceMin?: number;
  experienceMax?: number;
}
