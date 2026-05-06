import { AccessTokenPayload } from "../modules/auth/auth.types";
import { Request } from "express";

declare global {
    namespace Express {
        interface UserPayload {
            id: string;
            orgId: string;
            role: string;
        }

        interface Request {
            user: AccessTokenPayload;
        }
    }
}
