// admin.controller.ts

import { Request, Response } from "express";
import { organizationService } from "./admin.service";

export class AdminController {
  // admin.controller.ts

  async createOrganization(req: Request, res: Response) {
    try {
      const user = req.user;

      // ONLY SUPER ADMIN
      if (user.role !== "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Only super admin can create organization",
        });
      }

      const organization =
        await organizationService.createOrganizationWithAdmin({
          organizationName: req.body.organizationName,

          // ADMIN DETAILS
          adminName: req.body.adminName,
          adminEmail: req.body.adminEmail,
          adminPassword: req.body.adminPassword,

          // SUPER ADMIN ID
          createdById: user.id,
        });

      res.status(201).json({
        success: true,
        message: "Organization and admin created successfully",
        data: organization,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
  // GET ORGANIZATIONS CREATED BY SUPER ADMIN
  async getAllOrganizations(req: Request, res: Response) {
    try {
      const user = req.user;

      const organizations = await organizationService.getAllOrganizations(
        user.id,
      );

      res.status(200).json({
        success: true,
        data: organizations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  // CREATE BRANCH
  async createBranch(req: Request, res: Response) {
    try {
      const branch = await organizationService.createBranch({
        name: req.body.name,
        organizationId: req.body.organizationId,
      });

      res.status(201).json({
        success: true,
        message: "Branch created successfully",
        data: branch,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // GET BRANCHES
  async getBranches(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId as string;

      const branches = await organizationService.getBranches(organizationId);

      res.status(200).json({
        success: true,
        data: branches,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
