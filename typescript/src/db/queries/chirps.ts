import { asc, desc, eq } from 'drizzle-orm';
import { db } from "../index.js";
import { NewChirp, Chirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp): Promise<NewChirp> {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getAllChirps(authorId: string | null, sort: string): Promise<Chirp[]> {
  let result: Chirp[];
  const operator = sort === 'asc' ? asc : desc; 
  if (authorId !== null) {
    result = await db.select().from(chirps).where(eq(chirps.userId, authorId)).orderBy(operator(chirps.createdAt));
  } else {
    result = await db.select().from(chirps).orderBy(operator(chirps.createdAt));
  }
  return result;
}

export async function getChirpById(chirpId: string): Promise<Chirp | undefined> {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId)).limit(1);
  return result;
}

export async function deleteChirpById(chirpId: string): Promise<boolean> {
  const deletedChirpIds: { deletedId: string }[] = await db.delete(chirps)
  .where(eq(chirps.id, chirpId))
  .returning({ deletedId: chirps.id });
  return deletedChirpIds[0].deletedId === chirpId;
}
