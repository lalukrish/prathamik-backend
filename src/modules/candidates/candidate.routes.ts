import { Router } from "express";
import {
  candidateController,
  CandidateController,
} from "./candidate.controller";
import { upload } from "../../middlewares/upload.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { applyJobSchema, updateCandidateProfileSchema } from "./candidate.type";

const router = Router();
const controller = new CandidateController();
router.get("/:id", candidateController.getSingleCandidateById);
router.get("/", candidateController.getAllCandidate);
router.post(
  "/candidate-apply/:jobId/:userId",

  upload.single("resume"),

  validate(applyJobSchema),

  candidateController.candidateApply,
);

router.put(
  "/update-profile/:userId",

  upload.single("resume"),

     validate(updateCandidateProfileSchema),

  candidateController.updateCandidateProfile,
);

router.put(
  "/delete-candidate/:id",

  candidateController.softDeleteCandidate,
);
export default router;
