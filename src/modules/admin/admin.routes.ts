import { Router } from "express";
import { userController } from "../users/user.controller";
import { AdminController } from "./admin.controller";

const router = Router();
const controller = new AdminController();

router.post("/create-organisation", controller.createOrganization);
router.get("/organizations", controller.getAllOrganizations);

export default router;
