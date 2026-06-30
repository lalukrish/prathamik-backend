import { Router } from "express";
import { AdminController } from "./admin.controller";

const router = Router();

const controller = new AdminController();

export default router;
