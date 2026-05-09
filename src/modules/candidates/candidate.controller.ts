import { Request, Response } from "express";
import { logger } from "../../config/logger";
import { candidateService } from "./candidate.service";

export class CandidateController {
  getSingleCandidateById = async (
    req: Request<{ id: string }>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const user = await candidateService.getCandidateById(id);

      res.status(200).json({
        success: true,
        message: "Candidate fetched successfully",
        data: user,
      });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };
  getAllCandidate = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const users = await candidateService.getAllCandidate(page, limit);

      res.json({
        success: true,
        message: "Candidates fetched successfully",
        data: users,
      });
    } catch (err: any) {
      res.status(500).json({
        error: err.message || "Failed to fetch all users",
      });
    }
  };
  candidateApply = async (
    req: Request<{ jobId: string }, {}>,

    res: Response,
  ) => {
    try {
      const result = await candidateService.candidateApplyJob(
        req.params.jobId,
        req.params.userId,
        req.body,

        req.file,
      );

      return res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,

        message: error.message || "Failed to apply job",
      });
    }
  };
  updateCandidateProfile = async (req: Request, res: Response) => {
    try {
      const result = await candidateService.candidateUpdateProfile(
        req.params.userId,
        req.body,
        req.file,
      );

      return res.status(200).json({
        success: true,
        message: "Candidate profile updated successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update candidate profile",
      });
    }
  };
}

export const candidateController = new CandidateController();
