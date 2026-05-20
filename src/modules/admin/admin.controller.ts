// admin.controller.ts

import { Request, Response } from "express";
import { organizationService } from "./admin.service";

export class AdminController {
  // CREATE ORGANIZATION
  async createOrganization(req: Request, res: Response) {
    try {
      // USER FROM JWT

      const user = req.user;
      console.log("user", user);

      // ONLY SUPER ADMIN
      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only super admin can create organization",
        });
      }

      const organization = await organizationService.createOrganization({
        name: req.body.name,
        createdById: req.user.id,
      });

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
      const branches = await organizationService.getBranches(
        req.params.organizationId,
      );

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
