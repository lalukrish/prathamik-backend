import { Request } from "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      orgId?: string | null;
      role: string;
    }

    interface Request {
      user: UserPayload;
    }
  }
}
