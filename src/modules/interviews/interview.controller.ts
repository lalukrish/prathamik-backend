import { Request, Response } from "express";
import * as interviewService from "./interview.service";

export const scheduleInterview = async (req: Request, res: Response) => {
    const result = await interviewService.scheduleInterview({
        ...req.body,
        userId: req.user.id,
    });

    return res.status(201).json({
        success: true,
        message: "Interview scheduled successfully",
        data: result,
    });
};

export const getAllInterviews = async (req: Request, res: Response) => {
    const { organizationId, jobId, status, page, limit } = req.query;

    const result = await interviewService.getAllInterviews({
        organizationId: organizationId as string,
        jobId: jobId as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    return res.status(200).json({
        success: true,
        message: "Interviews fetched successfully",
        data: result,
    });
};

export const getInterviewById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const orgId = req.user.orgId;

    const result = await interviewService.getInterviewById(id, orgId);

    return res.status(200).json({
        success: true,
        message: "Interview fetched successfully",
        data: result,
    });
};

export const getInterviewByToken = async (req: Request, res: Response) => {
    const result = await interviewService.getInterviewByToken(req.params.token);

    return res.status(200).json({
        success: true,
        data: result,
    });
};

export const rescheduleInterview = async (req: Request, res: Response) => {
    const result = await interviewService.rescheduleInterview({
        interviewId: req.params.id,

        scheduledStartAt: req.body.scheduledStartAt,

        reason: req.body.reason,

        userId: req.user.id,
    });

    return res.status(200).json({
        success: true,
        message: "Interview rescheduled successfully",
        data: result,
    });
};

export const cancelInterview = async (req: Request, res: Response) => {
    const result = await interviewService.cancelInterviewService({
        interviewId: req.params.id,

        userId: req.user.id,

        reason: req.body.reason,
    });

    return res.status(200).json({
        success: true,
        message: "Interview cancelled successfully",
        data: result,
    });
};

export const interviewScheduleHistory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const orgId = req.user.orgId;
    if (!orgId) {
        throw new Error("Organization ID is required");
    }
    const result = await interviewService.getScheduleHistory(id, orgId);

    return res.status(200).json({
        success: true,
        message: "Interview history fetched successfully",
        data: result,
    });
};