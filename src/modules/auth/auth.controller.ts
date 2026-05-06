import { Request, Response } from "express";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "./auth.service";
import { setAuthCookies, clearAuthCookies } from "./auth.cookie";

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

    const newAccessToken = generateAccessToken({ userId });
    const newRefreshToken = generateRefreshToken({ userId });

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.json({ success: true });
};

// LOGOUT
export const logout = (req: Request, res: Response) => {
    clearAuthCookies(res);
    return res.json({ success: true });
};