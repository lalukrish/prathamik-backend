// transaction.controller.ts
import { Request, Response } from "express";
import { transactionService } from "./transaction.service";

export const transactionController = {
  async initiate(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { mockTestId, amount } = req.body;
      const result = await transactionService.initiate(
        userId,
        mockTestId,
        amount,
      );
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async confirmDummy(req: Request, res: Response) {
    try {
      const transactionId = req.params.transactionId as string;
      const result = await transactionService.confirmDummy(transactionId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await transactionService.getHistory(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
