import { Request, Response } from "express";
import { questionService } from "./question.service";
import { logger } from "../../config/logger";

export class QuestionController {
  createQuestion = async (req: Request, res: Response) => {
    try {
      const question = await questionService.createQuestion(req.body);

      logger.info({
        message: "Question created successfully",
      });

      res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: question,
      });
    } catch (err: any) {
      logger.error(err);

      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };

  getQuestionsByMockTest = async (
    req: Request<{ mockTestId: string }>,
    res: Response,
  ) => {
    try {
      const questions = await questionService.getQuestionsByMockTest(
        req.params.mockTestId,
      );

      res.status(200).json({
        success: true,
        data: questions,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };

  updateQuestion = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const question = await questionService.updateQuestion(
        req.params.id,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Question updated successfully",
        data: question,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };

  deleteQuestion = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await questionService.deleteQuestion(req.params.id);

      res.status(200).json({
        success: true,
        message: "Question deleted successfully",
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };
}

export const questionController = new QuestionController();
