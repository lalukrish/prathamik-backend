import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again later.",
    });
  },
});

/**
 * Resume Upload Limiter
 * Prevent AI abuse / cost explosion
 */
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many uploads. Please try again later.",
    });
  },
});

/**
 * AI Processing Limiter
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "AI request limit exceeded.",
    });
  },
});
