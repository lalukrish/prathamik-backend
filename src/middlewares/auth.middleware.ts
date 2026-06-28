import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import { authRepository } from "../modules/auth-section/auth.repository";
import { verifyAccessToken } from "../modules/auth/auth.service";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const result = verifyAccessToken(token);

  if (!result.valid) {
    if (result.expired) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }

  const session = await authRepository.findSessionById(
    result.decoded!.sessionId,
  );

  if (!session) {
    return res
      .status(401)
      .json({ success: false, message: "Session ended, please login again" });
  }

  await prisma.authSession.update({
    where: {
      userId: result.decoded!.id,
      id: session.id,
    },
    data: {
      lastActiveAt: new Date(),
    },
  });

  req.user = result.decoded!;
  next();
};

export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};
