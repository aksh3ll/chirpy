import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import crypto from 'node:crypto';

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  const now: number = Math.floor(Date.now() / 1000);
  const payload: payload = { 
    "iss": "chirpy", // issuer of the token
    "sub": userID, // subject of the token (the user ID)
    "iat": now, // issued at time (current time in seconds)
    "exp": now + expiresIn // expiration time (current time + expiresIn)
  };
  return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  let payload: payload;
  try {
    payload = jwt.verify(tokenString, secret) as payload;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
  if (payload.iss !== "chirpy") {
    throw new Error("Invalid token issuer");
  }
  if (typeof payload.sub !== "string") {
    throw new Error("Invalid token subject");
  }
  if (payload.exp === undefined || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token has expired");
  }
  return payload.sub; // return the user ID from the token
}

export function getBearerToken(req: Request): string {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    throw new Error("Authorization header is missing");
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new Error("Authorization header must be in the format 'Bearer <token>'");
  }
  return parts[1];
}

export function getAPIKey(req: Request): string {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    throw new Error("Authorization header is missing");
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "ApiKey") {
    throw new Error("Authorization header must be in the format 'ApiKey <token>'");
  }
  return parts[1];
}

export function makeRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
