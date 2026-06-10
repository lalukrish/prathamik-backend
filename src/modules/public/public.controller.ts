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

  async getJobPublicBySlug(req: Request<{ slug: string }>, res: Response) {
    try {
      const job = await publicService.getJob(req.params.slug);
      res.json({ success: true, data: job });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get job",
      });
    }
  }

  async validateInterviewToken(req: Request<{ token: string }>, res: Response) {
    try {
      const result = await publicService.validateInterviewToken(req.params.token);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to validate interview token",
      });
    }
  }
  async cancelInterview(
    req: Request,
    res: Response
  ) {
    const result = await publicService.cancelInterview(
      req.params.token,
      req.body.reason,
    );

    return res.status(200).json({
      success: true,
      message: "Interview cancelled successfully",
    });
  };

  async startInterview(req: Request<{ token: string }>, res: Response) {
    try {
      const result = await publicService.startInterview(req.params.token);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to start interview",
      });
    }
  }

  async getInterviewQuestion(
    req: Request,
    res: Response
  ) {
    const result =
      await publicService.getInterviewQuestion(
        req.params.token
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  };

  async submitInterviewAnswer(
    req: Request,
    res: Response
  ) {
    const result =
      await publicService.submitInterviewAnswer({
        token: req.params.token,
        questionId: req.body.questionId,
        answer: req.body.answer,
        durationSeconds: req.body.durationSeconds ? Number(req.body.durationSeconds) : 0,
      });

    return res.status(201).json({
      success: true,
      message:
        "Answer submitted successfully",
      data: result,
    });
  };

  async logSecurityEvent(
    req: Request,
    res: Response
  ) {
    const result =
      await publicService.logSecurityEvent({
        token: req.params.token,
        type: req.body.type,
        metadata: req.body.metadata,
      });

    return res.status(201).json({
      success: true,
      message: "Security event logged",
      data: result,
    });
  };

  async completeInterview(
    req: Request,
    res: Response
  ) {
    const token = req.params.token;
    if (!token) {

    }
    const result =
      await publicService.completeInterview(
        token
      );

    return res.status(200).json({
      success: true,
      message:
        "Interview completed successfully",
      data: result,
    });
  };
}
