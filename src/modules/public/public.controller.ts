import { Request, Response } from "express";
import { publicService } from "./public.service";

export class PublicController {
  searchMockTestsPublic = async (req: Request, res: Response) => {
    try {
      console.log("first");
      const query = (req.query.q as string) || "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await publicService.searchMockTestsPublic(
        query,
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
}

export const publicController = new PublicController();
