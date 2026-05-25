import { Request, Response } from "express";
import { logger } from "../../config/logger";
import { JobService } from "./job.service";
import { CreateJobDTO, UpdateJobDTO } from "./job.types";

const jobService = new JobService();

export class JobController {
  async create(req: Request<{}, {}, CreateJobDTO>, res: Response) {
    try {
      const userId = req.user?.id;
      const orgId = req.user?.orgId;
      if (!orgId) {
        throw new Error("Organization ID is required");
      }

      const job = await jobService.createJob(req.body, userId, orgId);
      logger.info({
        data: req.body,
        userId: userId,
        orgId: orgId,
        message: "Job created successfully",
      });
      res.json({ success: true, data: job });
    } catch (error) {
      logger.error({ error: error, message: "Failed to create job" });
      res.status(500).json({ error: "Failed to create job" });
    }
  }

  async update(req: Request<{ id: string }, {}, UpdateJobDTO>, res: Response) {
    try {
      const userId = req.user?.id;

      const job = await jobService.updateJob(req.params.id, req.body, userId);
      logger.info({
        data: req.body,
        userId: userId,
        message: "Job updated successfully",
      });
      res.json({ success: true, data: job });
    } catch (error) {
      logger.error({ error: error, message: "Failed to update job" });
      res.status(500).json({ error: "Failed to update job" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        throw new Error("Organization ID is required");
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";

      const result = await jobService.getJobs(orgId, page, limit, search);
      res.json({ success: true, ...result });
    } catch (error) {
      logger.error({ error: error, message: "Failed to get jobs" });
      res.status(500).json({ error: "Failed to get jobs" });
    }
  }

  async getOne(req: Request<{ id: string }>, res: Response) {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        throw new Error("Organization ID is required");
      }

      const job = await jobService.getJob(req.params.id, orgId);
      console.log(job);
      res.json({ success: true, data: job });
    } catch (error) {
      logger.error({ error: error, message: "Failed to get job" });
      res.status(500).json({ error: "Failed to get job" });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        throw new Error("Organization ID is required");
      }

      const job = await jobService.deleteJob(req.params.id, orgId);
      logger.info({
        data: job,
        orgId: orgId,
        message: "Job deleted successfully",
      });
      res.json({ success: true, data: job });
    } catch (error) {
      logger.error({ error: error, message: "Failed to delete job" });
      res.status(500).json({ error: "Failed to delete job" });
    }
  }
}
