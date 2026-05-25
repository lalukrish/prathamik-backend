import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { JobController } from "./job.controller";
import { createJobSchema, updateJobSchema } from "./job.validator";

const router = Router();
const controller = new JobController();

router.post(
  "/",
  (req, res, next) => {
    console.log("CREATE JOB ROUTE HIT");
    next();
  },
  //  validate(createJobSchema),
  controller.create.bind(controller),
);
router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.put(
  "/:id",
  validate(updateJobSchema),
  controller.update.bind(controller),
);
router.delete("/:id", controller.delete.bind(controller));

router.get("/jobs/:jobId/candidates", controller.getAppliedCandidates);

export default router;
