import { eq } from 'drizzle-orm';
import { db } from "../index.js";
import { NewUser, User, users } from "../schema.js";

export async function createUser(user: NewUser): Promise<NewUser | undefined> {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function updateUser(user: User): Promise<User> {
  const [result] = await db
    .update(users)
    .set({email: user.email, hashedPassword: user.hashedPassword})
    .where(eq(users.id, user.id))
    .returning();
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [result] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result;
}

export async function upgradeUser(userId: string): Promise<boolean> {
  const [result] = await db
    .update(users)
    .set({isChirpyRed: true})
    .where(eq(users.id, userId))
    .returning({isChirpyRed: users.isChirpyRed});
  return result.isChirpyRed === true;
}
