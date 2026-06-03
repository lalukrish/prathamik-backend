import { Router } from "express";
import * as interviewController from "./interview.controller";
const router = Router();

router.post("/schedule", interviewController.scheduleInterview);
// {
//   "applicationId": "9c5c0f40-35d8-4cb6-8c75-9a5f2f0f5d11",
//   "templateId": "e1c0d55f-58df-4b2c-bfe0-9d88b3cb4c56",
//   "scheduledStartAt": "2026-06-10T10:00:00.000Z",
// }

router.get("/get-all-interviews", interviewController.getAllInterviews);
router.get("/get-interview/:id", interviewController.getInterviewById);

export default router;