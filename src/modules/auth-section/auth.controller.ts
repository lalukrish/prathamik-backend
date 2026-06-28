import { Request, Response } from "express";
import { authService } from "./auth.service";
import { logger } from "../../config/logger";

export class AuthController {
  signup = async (req: Request, res: Response) => {
    try {
      const user = await authService.signup(req.body);

      logger.info({
        email: user.email,
        message: "User registered successfully",
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (err: any) {
      logger.error({
        error: err,
        message: "Failed to register user",
      });

      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      console.log("first");

      const result = await authService.login(req.body);
      logger.info({
        email: req.body.email,
        message: "User login successful",
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (err: any) {
      logger.error({
        error: err,
        message: "Login failed",
      });

      res.status(401).json({
        success: false,
        message: err.message,
      });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: tokens,
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message,
      });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      await authService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };
}

export const authController = new AuthController();
