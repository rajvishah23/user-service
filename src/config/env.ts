// src/config/env.ts
import { SignOptions } from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const ACCESS_TOKEN_EXPIRES =
  (process.env.ACCESS_TOKEN_EXPIRES || "15m") as SignOptions["expiresIn"];

export const REFRESH_TOKEN_EXPIRES =
  (process.env.REFRESH_TOKEN_EXPIRES || "7d") as SignOptions["expiresIn"];

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("Missing JWT secrets in .env");
}