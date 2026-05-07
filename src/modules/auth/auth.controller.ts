import { Request, Response } from "express";
import { authService } from "./auth.service";
import { normalizeIP } from "../../utils/ip";

export const authController = {
    async login(req: Request, res: Response) {
        try {
            const userAgent = req.headers["user-agent"] || "";

            let device = "Unknown Device";

            if (userAgent.includes("Postman")) {
                device = "Postman";
            } else if (userAgent.includes("iPhone")) {
                device = "iPhone";
            } else if (userAgent.includes("iPad")) {
                device = "iPad";
            } else if (userAgent.includes("Mac")) {
                device = "Mac";
            } else if (userAgent.includes("Android")) {
                device = "Android";
            } else if (userAgent.includes("Windows")) {
                device = "Windows PC";
            } else if (userAgent.includes("Linux")) {
                device = "Linux PC";
            } else if (userAgent.includes("Mobile")) {
                device = "Mobile Device";
            } else if (userAgent.includes("SmartTV")) {
                device = "Smart TV";
            } else if (userAgent.includes("PlayStation")) {
                device = "PlayStation";
            } else if (userAgent.includes("Xbox")) {
                device = "Xbox";
            } else if (userAgent.includes("Nintendo")) {
                device = "Nintendo";
            }

            const result = await authService.login(req.body, {
                ip: normalizeIP(req.ip),
                userAgent,
                device,
            });

            res.json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message,
            });
        }
    },

    async refresh(req: Request, res: Response) {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        try {
            const result = await authService.refresh(refreshToken);
            return res.json({ success: true, data: result });
        } catch (error: any) {
            const status = error.message === "SESSION_EXPIRED" ? 401 : 403;
            return res.status(status).json({ success: false, message: error.message });
        }
    },

    async register(req: Request, res: Response) {
        const results = await authService.register(req.body);
        if (!results) {
            return res.status(400).json({ success: false, message: "Registration failed" });
        }
        return res.status(201).json({ success: true, data: results });
    },

    async logout(req: Request, res: Response) {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await authService.logout(refreshToken);
        }
        return res.json({ success: true, message: "Logged out" });
    },
};
