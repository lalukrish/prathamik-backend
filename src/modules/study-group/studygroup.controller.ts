// studyGroup.controller.ts
import { Request, Response } from "express";
import { studyGroupService } from "./studygroup.service";

export const studyGroupController = {
  async create(req: Request, res: Response) {
    try {
      console.log("req.", req.user);
      const userId = req.user!.userId;
      const { category, title, content } = req.body;
      const result = await studyGroupService.createTopic(userId, {
        category,
        title,
        content,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getByCategory(req: Request, res: Response) {
    try {
      const category = req.params?.category as string;
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);
      const result = await studyGroupService.getByCategory(
        category,
        page,
        limit,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async vote(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const topicId = req.params?.topicId as string;
      const { importance } = req.body;
      const result = await studyGroupService.vote(userId, topicId, importance);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async removeVote(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const topicId = req.params?.topicId as string;
      const result = await studyGroupService.removeVote(userId, topicId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
