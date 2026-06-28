// studyGroup.routes.ts
import { Router } from "express";
import { studyGroupController } from "./studygroup.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", studyGroupController.create);
router.get("/:category", studyGroupController.getByCategory);
router.post("/:topicId/vote", studyGroupController.vote);
router.delete("/:topicId/vote", studyGroupController.removeVote);

export default router;
