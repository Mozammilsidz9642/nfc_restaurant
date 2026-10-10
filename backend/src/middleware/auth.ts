import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { Manager } from "../models/Manager";

export interface AuthUser extends JwtPayload {
  id: string;
  username: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function protectManager(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
    return;
  }

  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "nfc_super_secure_secret_key_2026");
  if (!secret) {
    res.status(500).json({ success: false, message: "Manager authentication is not configured" });
    return;
  }

  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, secret);
  } catch (error) {
    console.warn("Manager auth rejected an invalid token:", error);
    res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
    return;
  }

  if (
    typeof decoded === "string" ||
    typeof decoded.id !== "string" ||
    typeof decoded.username !== "string" ||
    typeof decoded.role !== "string"
  ) {
    res.status(401).json({ success: false, message: "Unauthorized: Invalid manager token payload" });
    return;
  }

  if (mongoose.connection.readyState === 1) {
    try {
      if (mongoose.Types.ObjectId.isValid(decoded.id)) {
        const manager = await Manager.exists({ _id: decoded.id });
        if (!manager) {
          res.status(401).json({ success: false, message: "Unauthorized: Manager account not found" });
          return;
        }
      }
    } catch (error) {
      console.warn("Manager auth check fallback:", error);
    }
  }

  req.user = decoded as AuthUser;
  next();
}
