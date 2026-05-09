import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/auth.service";
import { authRepository } from "../modules/auth/auth.repository";
import { AccessTokenPayload } from "../modules/auth/auth.types";
import { prisma } from "../config/db";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    console.log(token, "token")
    const result = verifyAccessToken(token);

    if (!result.valid) {
        if (result.expired) {
            return res.status(401).json({ success: false, message: "Token expired", code: "TOKEN_EXPIRED" });
        }
        return res.status(403).json({ success: false, message: "Invalid token" });
    }

    const session = await authRepository.findSessionById(result.decoded!.sessionId);


    if (!session) {
        return res.status(401).json({ success: false, message: "Session ended, please login again" });
    }

    let a = await prisma.session.update({
        where: {
            userId: result.decoded!.id,
            id: session.id,
        },

        data: {
            lastActiveAt: new Date(),
        },
    });

    console.log(a)

    req.user = result.decoded!;
    next();
};