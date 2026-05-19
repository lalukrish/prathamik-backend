import { Router } from "express";
import { JobController } from "./job.controller";
import { createJobSchema, updateJobSchema } from "./job.validator";
import { validate } from "../../middlewares/validation.middleware";

const router = Router();
const controller = new JobController();

router.post("/", validate(createJobSchema), controller.create.bind(controller));
router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.put(
  "/:id",
  validate(updateJobSchema),
  controller.update.bind(controller),
);
router.delete("/:id", controller.delete.bind(controller));

export default router;
