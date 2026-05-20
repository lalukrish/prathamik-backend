import { z } from "zod";
import { loginSchema } from "./auth.validator";

export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  // role: string;
  orgId: string | null;
  // isActive: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  id: string;
  orgId: string | null;
  role: string;
  sessionId: string;
}

export interface RefreshTokenPayload {
  id: string;
  sessionId: string;
}
