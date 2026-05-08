import { Request, Response } from "express";

import { PublicService } from "./public.service";

import { ApplyJobDTO } from "./public.types";

const publicService = new PublicService();

export class PublicController {
  async applyJob(
    req: Request<{ jobId: string }, {}, ApplyJobDTO>,

    res: Response,
  ) {
    try {
      const result = await publicService.applyJob(
        req.params.jobId,

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
  }
}
