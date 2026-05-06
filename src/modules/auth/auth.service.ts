import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { AccessTokenPayload, RefreshTokenPayload } from "./auth.types";

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

// GENERATE
export const generateAccessToken = (payload: AccessTokenPayload) => {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: RefreshTokenPayload) => {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "1d" });
};

// VERIFY ACCESS TOKEN
export const verifyAccessToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
        return { valid: true, decoded };
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            return { valid: false, expired: true };
        }
        if (err instanceof JsonWebTokenError) {
            return { valid: false, expired: false };
        }
        return { valid: false, expired: false };
    }
};

// VERIFY REFRESH TOKEN
export const verifyRefreshToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
        return { valid: true, decoded };
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            return { valid: false, expired: true };
        }
        return { valid: false, expired: false };
    }
};