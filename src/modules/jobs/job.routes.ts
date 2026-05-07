import { Router } from "express";
import { JobController } from "./job.controller";

const router = Router();
const controller = new JobController();

router.post("/", controller.create.bind(controller));
router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
