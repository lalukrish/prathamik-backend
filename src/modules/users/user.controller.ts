import { Request, Response } from "express";
import { userService } from "./user.service";
import { UserData } from "./user.types";

export class UserController {
  getSingleUserById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const user = await userService.getUserById(id);

      res.json(user);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };
  createUser = async (req: Request, res: Response) => {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json(user);
    } catch (err: any) {
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
      const user = await userService.updateUser(id, req.body);

      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({
        error: err.message || "Failed to update user",
      });
    }
  };
  softDeleteUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
      console.log("first?>>>");

      const { id } = req.params;
      const { isActive } = req.body;
      console.log("first", isActive);
      if (!id) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }
      const user = await userService.deleteSoft(id, isActive);

      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({
        error: err.message || "Failed to update user",
      });
    }
  };
}

export const userController = new UserController();
