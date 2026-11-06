import { asc, eq } from 'drizzle-orm';
import { db } from "../index.js";
import { refreshTokens, NewRefreshToken, RefreshToken } from "../schema.js";
import { makeRefreshToken } from "../../auth.js";

export async function createRefreshToken(userId: string, expiresAt: Date): Promise<string> {
  const refreshToken: RefreshToken = {
    token: makeRefreshToken(),
    userId: userId,
    expiresAt: expiresAt
  } as RefreshToken;
  const [result] = await db
    .insert(refreshTokens)
    .values(refreshToken)
    .onConflictDoNothing()
    .returning();
  return result.token;
}

export async function getRefreshToken(token: string): Promise<RefreshToken | null> {
  const result = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token))
    .orderBy(asc(refreshTokens.expiresAt))
    .limit(1);
  if (result.length === 0) {
    return null;
  }
  return result[0];
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  const result = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() }) // set revokedAt to now to revoke the token
    .where(eq(refreshTokens.token, token))
    .returning({ revokedAt: refreshTokens.revokedAt });
  if (result.length === 0) {
    return false;
  }
  return result[0].revokedAt != null;
}
