import { Request, Response } from "express";
import { subjectService } from "./subject.service";

export class SubjectController {
  create = async (req: Request, res: Response) => {
    try {
      const subject = await subjectService.createSubject(req.body.name);

      res.status(201).json({
        success: true,
        data: subject,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  getAll = async (req: Request, res: Response) => {
    const subjects = await subjectService.getAllSubjects();

    res.json({
      success: true,
      data: subjects,
    });
  };

  delete = async (req: Request, res: Response) => {
    await subjectService.deleteSubject(req.params?.id as string);

    res.json({
      success: true,
      message: "Subject deleted successfully",
    });
  };
}

export const subjectController = new SubjectController();
