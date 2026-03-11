import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT } from "./auth.js";

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
