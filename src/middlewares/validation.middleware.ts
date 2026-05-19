import { Request, Response, NextFunction } from "express";

import { ZodError } from "zod";

export const validate =
  (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = validatedData.body;
      // req.query = validatedData.query;
      // req.params = validatedData.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((err) => ({
            field: err.path
              .filter(
                (item) =>
                  item !== "body" && item !== "query" && item !== "params",
              )
              .join("."),

            message: err.message,
          })),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
