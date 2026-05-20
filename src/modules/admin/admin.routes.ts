import { Router } from "express";
import { AdminController } from "./admin.controller";

const router = Router();

const controller = new AdminController();

// ORGANIZATION
router.post("/create-organisation", controller.createOrganization);

router.get("/organizations", controller.getAllOrganizations);

// BRANCH
router.post("/create-branch", controller.createBranch);

router.get("/organizations/:organizationId/branches", controller.getBranches);

export default router;
