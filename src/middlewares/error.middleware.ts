import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

interface CustomError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorMiddleware = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("❌ Error:", err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                statusCode = 409;
                message = "Duplicate field value already exists";
                break;

            case "P2025":
                statusCode = 404;
                message = "Record not found";
                break;

            default:
                statusCode = 400;
                message = "Database operation failed";
                break;
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Invalid database query";
    }

    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    if (err.name === "MulterError") {
        statusCode = 400;
        message = "File upload error";
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
            error: err,
        }),
    });
};