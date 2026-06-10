import { Router } from "express";
import { PublicController } from "./public.controller";
import { validate } from "../../middlewares/validation.middleware";
import { applyJobSchema, cancelInterviewSchema, interviewSecurityEventSchema, submitInterviewAnswerSchema } from "./public.validator";
import { upload } from "../../middlewares/upload.middleware";
const router = Router();
const controller = new PublicController();
router.post("/apply/:jobId", upload.single("resume"),
  // validate(applyJobSchema),
  controller.applyJob,
);

router.get("/jobs/:slug", controller.getJobPublicBySlug);

router.get("/interviews/:token/validate", controller.validateInterviewToken);
router.post("/interviews/:token/cancel", validate(cancelInterviewSchema), controller.cancelInterview);
router.get("/interviews/:token/start", controller.startInterview);
router.get("/interviews/:token/question", controller.getInterviewQuestion);
router.post("/interviews/:token/answer", validate(submitInterviewAnswerSchema), controller.submitInterviewAnswer);
router.post("/interviews/:token/security-event", validate(interviewSecurityEventSchema), controller.logSecurityEvent);
router.post("/interviews/:token/complete", controller.completeInterview);
export default router;
