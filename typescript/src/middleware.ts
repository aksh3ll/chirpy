import { Request, Response, NextFunction } from "express";
import config from "./config.js";
import { InvalidChirpError } from "./handlers/chirps.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        if (res.statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
        }
    });
    next();
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof InvalidChirpError) {
    res.status(400).json({ error: err.message });
  } else {
    console.error("Error: ", err);
    res.status(500).json({ error: "Something went wrong on our end" });
  }
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
  config.fileserverHits += 1;
  next();
}