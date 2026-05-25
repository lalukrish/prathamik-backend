import { Router } from "express";
import { AdminController } from "./admin.controller";

const router = Router();

const controller = new AdminController();

router.post("/create-organization", controller.createOrganization);

router.put("/organization/:id", controller.updateOrganization);

router.post("/create-branch", controller.createBranch);

router.get("/organizations/:organizationId/branches", controller.getBranches);

router.get("/organizations", controller.getAllOrganizations);

export default router;
