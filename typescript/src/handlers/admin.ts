import { Request, Response, NextFunction } from "express";
import { deleteAllUsers } from "../db/queries/users.js";
import config from "../config.js";

export function handlerReadiness(req: Request, res: Response) {
    res.status(200).set("Content-Type", "text/plain; charset=utf-8").send("OK");
}

export async function handlerMetrics(req: Request, res: Response) {
  const html = `<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`;
  res.status(200).set("Content-Type", "text/html; charset=utf-8").send(html);
}

export async function handlerReset(req: Request, res: Response) {
  config.fileserverHits = 0;
  if (config.platform !== "dev") {
    res.status(403).send();
    return;
  }
  await deleteAllUsers();
  res.status(200).set("Content-Type", "text/plain; charset=utf-8").send();
}
