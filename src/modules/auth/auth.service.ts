import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { authRepository } from "./auth.repository";
import { AuthResponse, LoginInput } from "./auth.types";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

const hashToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

export const authService = {
    async login(
        data: LoginInput,
        meta: { ip?: string; userAgent?: string }
    ): Promise<AuthResponse> {
        const user = await authRepository.findByEmail(data.email);

        if (!user || !user.isActive) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(data.password, user.password);

        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                orgId: user.orgId,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const tokenHash = hashToken(token);

        await authRepository.createSession({
            userId: user.id,
            tokenHash,
            ipAddress: meta.ip,
            userAgent: meta.userAgent,
            device: "web",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                orgId: user.orgId,
            },
            token,
        };
    },
};