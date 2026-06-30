// import { Request, Response, NextFunction } from "express";
// import { ZodError, ZodTypeAny } from "zod";

// export const validate =
//   (schema: ZodTypeAny) =>
//     async (
//       req: Request,
//       res: Response,
//       next: NextFunction
//     ) => {
//       try {
//         const validatedData = await schema.parseAsync({
//           body: req.body,
//           params: req.params,
//           query: req.query,
//         });

//         if (validatedData.body)
//           req.body = validatedData.body;

//         if (validatedData.params)
//           req.params = validatedData.params;

//         next();
//       } catch (error) {
//         console.error(error);

//         if (error instanceof ZodError) {
//           return res.status(400).json({
//             success: false,
//             message: "Validation failed",
//             errors: error.issues.map((err) => ({
//               field: err.path.join("."),
//               message: err.message,
//             })),
//           });
//         }

//         return res.status(500).json({
//           success: false,
//           message: "Internal server error",
//         });
//       }

//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//       });
//     }
//   };

// import { Request, Response, NextFunction } from "express";
// import { ZodError, ZodTypeAny } from "zod";

// export const validate =
//   (schema: ZodTypeAny) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const validatedData = await schema.parseAsync({
//         body: req.body,
//         params: req.params,
//         query: req.query,
//       });
//       console.log("req.body", req.body);
//       if (validatedData.body) req.body = validatedData.body;

//       if (validatedData.params) req.params = validatedData.params;

//       next();
//     } catch (error) {
//       console.error(error);

//       if (error instanceof ZodError) {
//         return res.status(400).json({
//           success: false,
//           message: "Validation failed",
//           errors: error.issues.map((err) => ({
//             field: err.path.join("."),
//             message: err.message,
//           })),
//         });
//       }

//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//       });
//     }
//   };

import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema, z } from "zod";

export const validate =
  <T extends ZodSchema>(schema: T) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = (await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      })) as z.infer<T>;

      console.log("req.body", req.body);

      if ((validatedData as Record<string, unknown>).body) {
        req.body = (validatedData as Record<string, unknown>).body;
      }
      if ((validatedData as Record<string, unknown>).params) {
        req.params = (validatedData as Record<string, unknown>)
          .params as typeof req.params;
      }

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
