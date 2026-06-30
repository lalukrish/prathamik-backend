import { Request, Response } from "express";
import { mockTestService } from "./mock-test.service";
import { logger } from "../../config/logger";

export class MockTestController {
  createMockTest = async (req: Request, res: Response) => {
    try {
      console.log("req", req.user);
      const thumbnail = (req.file as any)?.path || null;
      console.log("thu", thumbnail);
      const mockTest = await mockTestService.createMockTest(
        {
          ...req.body,
          thumbnail,
        },
        req.user?.userId as string,
      );

      logger.info({
        message: "Mock test created successfully",
      });

      res.status(201).json({
        success: true,
        message: "Mock test created successfully",
        data: mockTest,
      });
    } catch (err: any) {
      logger.error(err);

      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };

  getAllMockTests = async (_req: Request, res: Response) => {
    try {
      const tests = await mockTestService.getAllMockTests();

      res.status(200).json({
        success: true,
        data: tests,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };

  getMockTestById = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const test = await mockTestService.getMockTestById(
        req.params.id,
        req.user!.userId,
      );
      res.status(200).json({ success: true, data: test });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  };

  updateMockTest = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const test = await mockTestService.updateMockTest(
        req.params.id,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Mock test updated successfully",
        data: test,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };

  deleteMockTest = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await mockTestService.deleteMockTest(req.params.id);

      res.status(200).json({
        success: true,
        message: "Mock test deleted successfully",
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };
}

export const mockTestController = new MockTestController();
