import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT, extractBearerToken } from "./auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});


describe("JWT token verifying", () => {
  const user = "dummy";
  const secret = "VerySecretySecret!";
  let jwtToken: string;

  beforeAll(async () => {
    jwtToken = makeJWT(user, 3600, secret);
  });

  it("should return true for the correct password", async () => {
    const result = validateJWT(jwtToken, secret);
    expect(result).toBe(user);
  });
});

describe("Extract Bearer Token", () => {
  it("should extract the token from a valid Bearer header", () => {
    const authorization = "Bearer mytoken";
    const token = extractBearerToken(authorization);
    expect(token).toBe("mytoken");
  });

  it("should throw an error for a missing authorization header", () => {
    expect(() => extractBearerToken(undefined)).toThrow("Authorization header is missing");
  });

  it("should throw an error for an invalid Bearer header", () => {
    const authorization = "InvalidHeader mytoken";
    expect(() => extractBearerToken(authorization)).toThrow("Authorization header must be in the format 'Bearer <token>'");
  });
});
