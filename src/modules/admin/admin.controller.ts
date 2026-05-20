import { Request, Response } from "express";
import { organizationService } from "./admin.service";

export class AdminController {
  async createOrganization(req: Request, res: Response) {
    try {
      const user = req.body;

      if (user.role !== "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Only super admin can create organization",
        });
      }

      const organization = await organizationService.createOrganization(
        req.body,
        user.id,
      );

      res.status(201).json({
        success: true,
        message: "Organization created successfully",
        data: organization,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
