import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository";
import { AuthResponse, LoginInput } from "./auth.types";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authService = {


    async login(data: LoginInput): Promise<AuthResponse> {
        const user = await authRepository.findByEmail(data.email);

        if (!user) {
            throw new Error("Invalid credentials");
        }

        if (!user || !user.isActive) {
            throw new Error("User is inactive or not found");
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