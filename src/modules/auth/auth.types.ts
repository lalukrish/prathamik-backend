import { z } from "zod";
import { loginSchema } from "./auth.validator";

export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    orgId: string;
    isActive: boolean;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}