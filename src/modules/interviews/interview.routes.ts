import { Router } from "express";
import * as interviewController from "./interview.controller";
const router = Router();

router.post("/schedule", interviewController.scheduleInterview);
router.get("/get-all-interviews", interviewController.getAllInterviews);
router.get("/get-interview/:id", interviewController.getInterviewById);
router.post("/:id/reschedule", interviewController.rescheduleInterview);
router.post("/:id/cancel", interviewController.cancelInterview);
router.get("/:id/schedule-history", interviewController.interviewScheduleHistory);
export default router;
