import { Request, Response } from "express";
import { JobService } from "./job.service";
import { CreateJobDTO, UpdateJobDTO } from "./job.types";
import { logger } from "../../config/logger";

const jobService = new JobService();

export class JobController {
  async create(req: Request<{}, {}, CreateJobDTO>, res: Response) {
    try {
      const userId = "fc74c489-6a4f-4533-9d85-cf1e389debcd";
      const orgId = "ef690f98-993f-4173-8aee-28dcf82050da";

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
      const userId = "fc74c489-6a4f-4533-9d85-cf1e389debcd";

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
      const orgId = "ef690f98-993f-4173-8aee-28dcf82050da";

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await jobService.getJobs(orgId, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      logger.error({ error: error, message: "Failed to get jobs" });
      res.status(500).json({ error: "Failed to get jobs" });
    }
  }

  async getOne(req: Request<{ id: string }>, res: Response) {
    try {
      const orgId = "ef690f98-993f-4173-8aee-28dcf82050da";
      const job = await jobService.getJob(req.params.id, orgId);
      res.json({ success: true, data: job });
    } catch (error) {
      logger.error({ error: error, message: "Failed to get job" });
      res.status(500).json({ error: "Failed to get job" });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const orgId = "ef690f98-993f-4173-8aee-28dcf82050da";
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
