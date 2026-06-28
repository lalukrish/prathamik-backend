import { z } from "zod";
import { loginSchema } from "./auth.validator";

export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  // role: string;
  orgId: string | null;
  orgName?: string;
  // isActive: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  orgName?: string;
}

export interface AccessTokenPayload {
  id: string;
  role: string;
  sessionId: string;
}

export interface RefreshTokenPayload {
  id: string;
  sessionId: string;
}
