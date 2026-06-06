import { Router } from "express";
import { PublicController } from "./public.controller";
import { validate } from "../../middlewares/validation.middleware";
import { applyJobSchema } from "./public.validator";
import { upload } from "../../middlewares/upload.middleware";
const router = Router();
const controller = new PublicController();
router.post("/apply/:jobId", upload.single("resume"),
  // validate(applyJobSchema),
  controller.applyJob,
);

router.get("/jobs/:slug", controller.getJobPublicBySlug);

router.get("/interviews/:token/validate", controller.validateInterviewToken);
// router.post("/interviews/:token/start", controller.startInterview);
// router.get("/interviews/:id/question", controller.getInterviewQuestion);
// router.post("/interviews/:id/answer", controller.submitInterviewAnswer);
// router.post("/interviews/:id/complete", controller.completeInterview);
export default router;
