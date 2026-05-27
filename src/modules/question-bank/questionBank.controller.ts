import { Request, Response } from "express";
import * as service from "./questionBank.service";

export const createQuestionBank = async (req: Request, res: Response) => {
  const result = await service.createQuestionBank(
    req.user.orgId,
    req.user.id,
    req.body,
  );

  return res.status(201).json({
    success: true,
    data: result,
  });
};

export const getQuestionBanks = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const search = (req.query.search as string) || "";

  const result = await service.getQuestionBanks(
    req.user.orgId,
    page,
    limit,
    search,
  );

  return res.status(200).json({
    success: true,
    result,
  });
};

export const getQuestionBankById = async (req: Request, res: Response) => {
  const result = await service.getQuestionBankById(
    req.params.id,
    req.user.orgId,
  );

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const updateQuestionBank = async (req: Request, res: Response) => {
  const result = await service.updateQuestionBank(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const deleteQuestionBank = async (req: Request, res: Response) => {
  const result = await service.deleteQuestionBank(req.params.id);
  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const bulkCreateQuestions = async (req: Request, res: Response) => {
  const result = await service.bulkCreateQuestions(req.params.id, req.body);
  return res.status(201).json({
    success: true,
    data: result,
  });
};

export const updateQuestion = async (req: Request, res: Response) => {
  const result = await service.updateQuestion(req.params.questionId, req.body);

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const deleteQuestion = async (req: Request, res: Response) => {
  const result = await service.deleteQuestion(req.params.questionId);

  return res.status(200).json({
    success: true,
    data: result,
  });
};
