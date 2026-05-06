import { Request, Response } from "express";
import { userService } from "./user.service";
import { UserData } from "./user.types";

export class UserController {
  getSingleUserById = async (req: Request, res: Response) => {
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
}

export const userController = new UserController();
