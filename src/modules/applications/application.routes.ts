import { Router } from "express";
import applicationController from "./application.controller";
import { validate } from "../../middlewares/validation.middleware";
import { changeApplicationStatusSchema } from "./application.validator";

const router = Router();

router.patch("/:applicationId/status", validate(changeApplicationStatusSchema), applicationController.changeStatus);

export default router;