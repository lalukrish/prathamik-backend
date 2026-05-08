import { Request, Response, NextFunction } from "express";

import { ZodError, ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,

        query: req.query,

        params: req.params,
      });

      //////////////////////////////////////////////////
      // ASSIGN ONLY BODY
      //////////////////////////////////////////////////

      req.body = validatedData.body;

      next();
    } catch (error) {
      console.log(error);

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
