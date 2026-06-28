import { Request, Response } from "express";
import { questionService } from "./question.service";

export class QuestionController {
  createQuestion = async (req: Request, res: Response) => {
    try {
      const question = await questionService.createQuestion(req.body);

      res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: question,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  getQuestions = async (req: Request, res: Response) => {
    try {
      const questions = await questionService.getQuestions(
        req.params.mockTestId,
      );

      res.json({
        success: true,
        data: questions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  deleteQuestion = async (req: Request, res: Response) => {
    try {
      await questionService.deleteQuestion(req.params.id);

      res.json({
        success: true,
        message: "Question deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
}

export const questionController = new QuestionController();
