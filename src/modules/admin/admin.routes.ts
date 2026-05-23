import { Router } from "express";
import { AdminController } from "./admin.controller";

const router = Router();

const controller = new AdminController();

router.post("/create-organization", controller.createOrganization);

router.get("/organizations", controller.getAllOrganizations);

router.put("/organization/:id", controller.updateOrganization);

router.post("/create-branch", controller.createBranch);

router.get("/organizations/:organizationId/branches", controller.getBranches);

export default router;
