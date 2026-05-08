import { Request, Response } from "express";
import { userService } from "./user.service";
import { logger } from "../../config/logger";

export class UserController {
  getSingleUserById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const user = await userService.getUserById(id);

      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user,
      });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };
  createUser = async (req: Request, res: Response) => {
    try {
      const user = await userService.createUser(req.body);
      logger.info({
        data: req.body,
        message: "user created successfully",
      });
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (err: any) {
      logger.error({ error: err, message: "Failed to create user" });

      res.status(400).json({ error: err.message });
    }
  };
  updateUser = async (req: Request<{ id: string }, any>, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }
      logger.info({
        data: req.body,
        message: "user updated successfully",
      });
      const user = await userService.updateUser(id, req.body);

      res.json({
        success: true,
        message: "user updated successfully",
        data: user,
      });
    } catch (err: any) {
      logger.error({ error: err, message: "Failed to update user" });
      res.status(500).json({
        error: err.message || "Failed to update user",
      });
    }
  };
  softDeleteUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      if (!id) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }
      const user = await userService.deleteSoft(id, isActive);
      logger.info({
        data: req.body,
        message: "user soft delete successfull",
      });
      res.json({
        success: true,
        message: "user deleted successfully",
        data: user,
      });
    } catch (err: any) {
      logger.error({ error: err, message: "Failed to delete user" });

      res.status(500).json({
        error: err.message || "Failed to update user",
      });
    }
  };
  getAllUser = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const isActive =
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined;

      const users = await userService.getAllUsers(page, limit, isActive);

      res.json({
        success: true,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (err: any) {
      res.status(500).json({
        error: err.message || "Failed to fetch all users",
      });
    }
  };
}

export const userController = new UserController();
