import { Request, Response } from "express";
import { authService } from "./auth.service";

export const authController = {
    async login(req: Request, res: Response) {
        try {
            const result = await authService.login(req.body, {
                ip: req.ip,
                userAgent: req.headers["user-agent"],
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
};