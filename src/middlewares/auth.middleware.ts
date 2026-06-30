// import { NextFunction, Request, Response } from "express";
// import { prisma } from "../config/db";
// import { authRepository } from "../modules/auth-section/auth.repository";
// // import { verifyAccessToken } from "../modules/auth/auth.service";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";
// const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// const hashToken = (token: string): string =>
//   crypto.createHash("sha256").update(token).digest("hex");

// export const generateAccessToken = (payload: AccessTokenPayload): string =>
//   jwt.sign(payload, ACCESS_SECRET, { expiresIn: "250m" });

// export const generateRefreshToken = (payload: RefreshTokenPayload): string =>
//   jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

// export const verifyAccessToken = (token: string) => {
//   try {
//     const decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

//     return { valid: true, expired: false, decoded };
//   } catch (err: any) {
//     return {
//       valid: false,
//       expired: err.name === "TokenExpiredError",
//       decoded: null,
//     };
//   }
// };

// interface AccessTokenPayload {
//   id: string;
//   role: string;
//   sessionId: string;
// }

// interface RefreshTokenPayload {
//   id: string;
//   sessionId: string;
// }

// const verifyRefreshToken = (token: string) => {
//   try {
//     const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
//     return { valid: true, expired: false, decoded };
//   } catch (err: any) {
//     return {
//       valid: false,
//       expired: err.name === "TokenExpiredError",
//       decoded: null,
//     };
//   }
// };

// export const authMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith("Bearer ")) {
//     return res.status(401).json({ success: false, message: "Unauthorized" });
//   }

//   const token = authHeader.split(" ")[1];
//   const result = verifyAccessToken(token);

//   if (!result.valid) {
//     if (result.expired) {
//       return res.status(401).json({
//         success: false,
//         message: "Token expired",
//         code: "TOKEN_EXPIRED",
//       });
//     }
//     return res.status(401).json({
//       success: false,
//       message: "Invalid token",
//       code: "INVALID_TOKEN",
//     });
//   }

//   const session = await authRepository.findSessionById(
//     result.decoded!.sessionId,
//   );

//   if (!session) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Session ended, please login again" });
//   }

//   await prisma.authSession.update({
//     where: {
//       userId: result.decoded!.id,
//       id: session.id,
//     },
//     data: {
//       lastActiveAt: new Date(),
//     },
//   });

//   req.user = result.decoded!;
//   next();
// };

// export const roleMiddleware = (...allowedRoles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied",
//       });
//     }

//     next();
//   };
// };

import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import { authRepository } from "../modules/auth-section/auth.repository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

interface AccessTokenPayload {
  userId: string;
  role: string;
  sessionId: string;
}

interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

export const generateAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: "250m" });

export const generateRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
    return { valid: true, expired: false, decoded };
  } catch (err: any) {
    return {
      valid: false,
      expired: err.name === "TokenExpiredError",
      decoded: null,
    };
  }
};

const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
    return { valid: true, expired: false, decoded };
  } catch (err: any) {
    return {
      valid: false,
      expired: err.name === "TokenExpiredError",
      decoded: null,
    };
  }
};

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
