import { Request, Response } from "express";
import { usersService } from "./users.service";

export class UsersController {
  // GET /users?search=&status=&role=&page=&limit=
  getAllUsers = async (req: Request, res: Response) => {
    const { search, status, role, page, limit } = req.query;

    const result = await usersService.getAllUsers({
      search: search as string | undefined,
      status: status as string | undefined,
      role: role as string | undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json({ success: true, ...result });
  };

  // GET /users/:userId
  getUserById = async (req: Request<{ userId: string }>, res: Response) => {
    const user = await usersService.getUserById(req.params.userId);
    res.json({ success: true, data: user });
  };

  // PATCH /users/:userId/status
  // Body: { status: "ACTIVE" | "BLOCKED" }
  updateStatus = async (req: Request<{ userId: string }>, res: Response) => {
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: "status is required" });
      return;
    }

    const user = await usersService.updateStatus(req.params.userId, status);
    res.json({ success: true, data: user });
  };

  // PATCH /users/:userId/role
  // Body: { role: "ADMIN" | "USER" }
  updateRole = async (req: Request<{ userId: string }>, res: Response) => {
    const { role } = req.body;

    if (!role) {
      res.status(400).json({ success: false, message: "role is required" });
      return;
    }

    const user = await usersService.updateRole(req.params.userId, role);
    res.json({ success: true, data: user });
  };
}

export const usersController = new UsersController();
