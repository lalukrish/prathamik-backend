import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const validatedData = await schema.parseAsync({
          body: req.body,
          params: req.params,
          query: req.query,
        });

        if (validatedData.body)
          req.body = validatedData.body;

        if (validatedData.params)
          req.params = validatedData.params;

        next();
      } catch (error) {
        console.error(error);

        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues.map((err) => ({
              field: err.path.join("."),
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