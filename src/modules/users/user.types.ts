import { Role, Organization, Session } from "@prisma/client";

export interface UserData {
  name: string;
  email: string;
  password: string[];
  role: Role;
  orgId: string;
  organization: Organization;
  sessions: Session;
}

export interface UpdateJobDTO {
  title?: string;
  description?: string;

  requiredSkills?: string[];
  niceToHave?: string[];

  experienceMin?: number;
  experienceMax?: number;
}
