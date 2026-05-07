import { Request, Response } from "express";
import { authService } from "./auth.service";

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
        ip: req.ip,
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
};
