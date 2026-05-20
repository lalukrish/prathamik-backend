import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authRepository } from "./auth.repository";
import {
  AuthResponse,
  LoginInput,
  AccessTokenPayload,
  RefreshTokenPayload,
} from "./auth.types";
import { register } from "module";
import { userService } from "../users/user.service";
import { CreateUserInput } from "../users/user.types";

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: "150m" });

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

export const verifyRefreshToken = (token: string) => {
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

export const authService = {
  async login(
    data: LoginInput,
    meta: { ip?: string; userAgent?: string; device?: string },
  ): Promise<AuthResponse> {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("EMAIL_NOT_FOUND");
    }

    if (!user.isActive) {
      throw new Error("ACCOUNT_DISABLED");
    }
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error("WRONG_PASSWORD");
    }
    const tempSessionId = crypto.randomUUID();

    const refreshToken = generateRefreshToken({
      id: user.id,
      sessionId: tempSessionId,
    });

    const tokenHash = hashToken(refreshToken);

    const session = await authRepository.createSession({
      userId: user.id,
      tokenHash,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      device: meta.device ?? "Unknown Device",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      orgId: user.orgId,
      sessionId: session.id,
    });

    await authRepository.updateSessionToken(
      session.id,
      hashToken(refreshToken),
    );

    return {
      user: {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        // role: user.role,
        orgId: user.orgId,
        // isActive: false,
      },
      accessToken,
      refreshToken,
    };
  },

  async refresh(rawRefreshToken: string): Promise<{ accessToken: string }> {
    const result = verifyRefreshToken(rawRefreshToken);

    if (!result.valid) {
      throw new Error(result.expired ? "SESSION_EXPIRED" : "INVALID_TOKEN");
    }

    const hashedToken = hashToken(rawRefreshToken);

    const session = await authRepository.findActiveSession(hashedToken);

    if (!session) {
      throw new Error("SESSION_REVOKED");
    }

    const user = await authRepository.findById(result.decoded!.id);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (!user.isActive) {
      throw new Error("ACCOUNT_DISABLED");
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      orgId: user.orgId,
      sessionId: session.id,
    });

    return {
      accessToken,
    };
  },

  async register(userDetails: CreateUserInput) {
    const newUser = await userService.createUser(userDetails);
    return newUser;
  },

  async logout(rawRefreshToken: string): Promise<void> {
    await authRepository.deactivateSession(hashToken(rawRefreshToken));
  },
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await authRepository.updatePassword(userId, hashedPassword);

    return true;
  },
};
