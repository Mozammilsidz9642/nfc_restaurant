import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthUser extends JwtPayload {
  id: string;
  username: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function protectManager(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "nfc_super_secure_secret_key_2026";
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string" ||
      typeof decoded.username !== "string" ||
      typeof decoded.role !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token",
      });
      return;
    }

    req.user = decoded as AuthUser;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
}
