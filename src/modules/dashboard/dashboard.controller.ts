import { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";

export class DashboardController {
  // GET /dashboard/tests
  // All attended (submitted/expired) tests with score summary
  getAttendedTests = async (req: Request, res: Response) => {
    const tests = await dashboardService.getAttendedTests(req.user!.userId);
    res.json({ success: true, data: tests });
  };

  // GET /dashboard/tests/:sessionId
  // Full result for one test — score breakdown + per-question review
  getTestResult = async (
    req: Request<{ sessionId: string }>,
    res: Response,
  ) => {
    console.log("res", req.user);
    const result = await dashboardService.getTestResult(
      req.params.sessionId,
      req.user!.userId,
    );
    res.json({ success: true, data: result });
  };

  // GET /dashboard/stats
  // Aggregate stats card data (total tests, avg score, accuracy, etc.)
  getOverallStats = async (req: Request, res: Response) => {
    const stats = await dashboardService.getOverallStats(req.user!.userId);
    res.json({ success: true, data: stats });
  };

  // GET /dashboard/in-progress
  // Tests currently in-progress or paused (can be resumed)
  getInProgressTests = async (req: Request, res: Response) => {
    const tests = await dashboardService.getInProgressTests(req.user!.userId);
    res.json({ success: true, data: tests });
  };
}

export const dashboardController = new DashboardController();
