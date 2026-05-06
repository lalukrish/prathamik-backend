import { Request, Response } from "express";
import { userService } from "./user.service";

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email || typeof email != "string") {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const user = await userService.getUserByEmail(email);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};
