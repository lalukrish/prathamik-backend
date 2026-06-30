import { Request, Response } from "express";
import { testSessionService } from "./test-session.service";

export class TestSessionController {
  getAvailableTests = async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const tests = await testSessionService.getAvailableTests(userId);

    res.json({
      success: true,
      data: tests,
    });
  };

  startTest = async (req: Request<{ mockTestId: string }>, res: Response) => {
    console.log("req", req.user);

    const session = await testSessionService.startTest(
      req.user!.userId,
      req.params.mockTestId,
    );

    res.json({
      success: true,
      data: session,
    });
  };

  getSession = async (req: Request<{ sessionId: string }>, res: Response) => {
    const session = await testSessionService.getSession(req.params.sessionId);

    res.json({
      success: true,
      data: session,
    });
  };

  pauseTest = async (req: Request<{ sessionId: string }>, res: Response) => {
    const session = await testSessionService.pauseTest(req.params.sessionId);

    res.json({
      success: true,
      data: session,
    });
  };

  resumeTest = async (req: Request<{ sessionId: string }>, res: Response) => {
    const session = await testSessionService.resumeTest(req.params.sessionId);

    res.json({
      success: true,
      data: session,
    });
  };

  submitAnswer = async (req: Request<{ sessionId: string }>, res: Response) => {
    const answer = await testSessionService.submitAnswer({
      sessionId: req.params.sessionId,
      ...req.body,
    });

    res.json({
      success: true,
      data: answer,
    });
  };

  submitTest = async (req: Request<{ sessionId: string }>, res: Response) => {
    const result = await testSessionService.submitTest(req.params.sessionId);

    res.json({
      success: true,
      data: result,
    });
  };
}

export const testSessionController = new TestSessionController();
