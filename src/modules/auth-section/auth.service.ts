import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository";

export class AuthService {
  async signup(data: any) {
    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return authRepository.createUser({
      ...data,
      password: hashedPassword,
    });
  }
  async login(data: any) {
    const user = await authRepository.findByEmail(data.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    const session = await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        sessionId: session.id,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "15m",
      },
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);

    const accessToken = jwt.sign(
      {
        userId: payload.userId,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "15m",
      },
    );

    return {
      accessToken,
    };
  }

  async logout(token: string) {
    return true;
  }
}

export const authService = new AuthService();
