import { Request, Response } from "express";
import { testSessionService, ApiError } from "./result.service";

function handleError(res: Response, err: unknown) {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ success: false, message: err.message });
  }
  console.error(err);
  return res
    .status(500)
    .json({ success: false, message: "Something went wrong." });
}

export const testSessionController = {
  // GET /tests
  async getAvailableTests(req: Request, res: Response) {
    try {
      const tests = await testSessionService.getAvailableTests();
      res.json({ success: true, data: tests });
    } catch (err) {
      handleError(res, err);
    }
  },

  // POST /start/:mockTestId
  async startTest(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { mockTestId } = req.params;

      const result = await testSessionService.startTest(userId, mockTestId);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      handleError(res, err);
    }
  },

  // GET /:sessionId
  async getSession(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const session = await testSessionService.getSession(sessionId, userId);
      res.json({ success: true, data: session });
    } catch (err) {
      handleError(res, err);
    }
  },

  // POST /:sessionId/answer
  async submitAnswer(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;
      const { questionId, selectedOptionId } = req.body;

      if (!questionId || !selectedOptionId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "questionId and selectedOptionId are required.",
          });
      }

      const result = await testSessionService.submitAnswer(
        sessionId,
        userId,
        questionId,
        selectedOptionId,
      );
      res.json({ success: true, data: result });
    } catch (err) {
      handleError(res, err);
    }
  },

  // PATCH /pause/:sessionId
  async pauseTest(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const result = await testSessionService.pauseTest(sessionId, userId);
      res.json({ success: true, data: result });
    } catch (err) {
      handleError(res, err);
    }
  },

  // PATCH /resume/:sessionId
  async resumeTest(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const result = await testSessionService.resumeTest(sessionId, userId);
      res.json({ success: true, data: result });
    } catch (err) {
      handleError(res, err);
    }
  },

  // POST /:sessionId/submit
  async submitTest(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;
      const isAutoSubmit = Boolean(req.body?.isAutoSubmit);

      const result = await testSessionService.submitTest(
        sessionId,
        userId,
        isAutoSubmit,
      );
      res.json({ success: true, data: result });
    } catch (err) {
      handleError(res, err);
    }
  },

  // GET /result/:sessionId
  async getResult(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const result = await testSessionService.getResult(sessionId, userId);
      res.json({ success: true, data: result });
    } catch (err) {
      handleError(res, err);
    }
  },
};
