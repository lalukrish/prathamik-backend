import { Router } from "express";
import {
  CandidateController,
  candidateController,
} from "./candidate.controller";

const router = Router();
const controller = new CandidateController();
router.get("/:id", candidateController.getSingleCandidateById);
router.get("/", candidateController.getAllCandidate);
export default router;
