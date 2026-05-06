import { Request, Response } from "express";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "./auth.service";
import { setAuthCookies, clearAuthCookies } from "./auth.cookie";
import { getUserById } from "./auth.repository";

// REFRESH
export const refresh = async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "No refresh token" });
    }

    const result = verifyRefreshToken(token);

    if (!result.valid) {
        if (result.expired) {
            return res.status(401).json({ message: "Refresh token expired" });
        }
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    const userId = result.decoded!.userId;

    const user = await getUserById(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken({
        id: user.id,
        orgId: user.orgId,
        role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
        userId: user.id,
    });

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.json({ success: true });
};

// LOGOUT
export const clearAuth = (req: Request, res: Response) => {
    clearAuthCookies(res);
    return res.json({ success: true });
};