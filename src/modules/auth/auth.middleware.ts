import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./auth.service";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};