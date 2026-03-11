import { Request, Response, NextFunction } from "express";
import { createChirp, getAllChirps, getChirpById, deleteChirpById } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import config from "../config.js";

export class InvalidChirpError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function handlerChirpsPost(req: Request, res: Response, next: NextFunction) {
    type chirpType = {
        body: string;
    };

    let userId: string;
    try {
      const token = getBearerToken(req);
      userId = validateJWT(token, config.secret);
    } catch (error) {
      res.status(401).send({"error": "Unauthorized"});
      return;
    }

    res.header("Content-Type", "application/json");
    let parsedBody: chirpType;
    try {
        parsedBody = req.body;
    } catch (error) {
        res.status(400).send({"error": "Invalid JSON"});
        return;
    }
    if (parsedBody.body.length > 140) {
        next(new InvalidChirpError("Chirp is too long. Max length is 140"));
        return;
    }
    try {
        const cleanedBody = parsedBody.body.replace(/(kerfuffle|sharbert|fornax)/gi, "****");
        const newChirp = await createChirp({ body: cleanedBody, userId: userId });
        res.status(201).send(JSON.stringify(newChirp));
    } catch (error) {
        res.status(400).send({"error": "Something went wrong"});
    }
}


export async function handlerChirpsDelete(req: Request, res: Response, next: NextFunction) {
  const chirpId = req.params.chirpId;
  if (!chirpId || typeof chirpId !== "string") {
    res.status(400).send({"error": "Chirp ID is required"});
    return;
  }
  let userId: string;
  try {
    const token = getBearerToken(req);
    userId = validateJWT(token, config.secret);
  } catch (error) {
    res.status(401).send({"error": "Unauthorized"});
    return;
  }
  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    res.status(404).send({"error": "Chirp not found"});
    return;
  }
  if (chirp.userId != userId) {
    res.status(403).send({"error": "You are not the author of the chirp"});
    return;
  }
  const deleteResult: boolean = await deleteChirpById(chirpId);
  if (deleteResult) {
    res.status(204).send();
  } else {
    res.status(400).send({"error": "The deletion failed"});

  }
}

export async function handlerChirpsGet(req: Request, res: Response, next: NextFunction) {
  let authorId: string | null = null;
  let authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }
  let sort: string | null = null;
  let sortQuery = req.query.sort;
  sort = (typeof sortQuery === "string" && sortQuery === "desc") ? 'desc' : 'asc';

  const chirps = await getAllChirps(authorId, sort);
  res.status(200).set("Content-Type", "application/json").send(JSON.stringify(chirps));
}

export async function handlerChirpsGetById(req: Request, res: Response, next: NextFunction) {
  const chirpId = req.params.chirpId;
  if (!chirpId || typeof chirpId !== "string") {
    res.status(400).send({"error": "Chirp ID is required"});
    return;
  }
  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    res.status(404).send({"error": "Chirp not found"});
    return;
  }
  res.status(200).set("Content-Type", "application/json").send(JSON.stringify(chirp));
}
