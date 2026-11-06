import express from "express";
import config from "./config.js";
import { handlerChirpsGet, handlerChirpsGetById, handlerChirpsPost, handlerChirpsDelete } from "./handlers/chirps.js";
import { handlerLogin, handlerUsersCreate, handlerUsersUpdate, handlerRefresh, handlerRevoke, handlerPolkaWebhooks } from "./handlers/users.js";
import { handlerMetrics, handlerReadiness, handlerReset } from "./handlers/admin.js";
import { errorHandler, middlewareLogResponses, middlewareMetricsInc } from "./middleware.js";

const app = express()
  .use(express.json())
  .use('/app', middlewareMetricsInc)
  .use('/app', express.static('./src/app'))
  .use(middlewareLogResponses)
  .get('/api/healthz', handlerReadiness)
  .post("/api/login", handlerLogin)
  .post("/api/users", handlerUsersCreate)
  .put("/api/users", handlerUsersUpdate)
  .get('/api/chirps', handlerChirpsGet)
  .post('/api/chirps', handlerChirpsPost)
  .delete('/api/chirps/:chirpId', handlerChirpsDelete)
  .get('/api/chirps/:chirpId', handlerChirpsGetById)
  .post('/api/refresh', handlerRefresh)
  .post('/api/revoke', handlerRevoke)
  .get('/admin/metrics', handlerMetrics)
  .post('/admin/reset', handlerReset)
  .post('/api/polka/webhooks', handlerPolkaWebhooks)
  .use(errorHandler)
  .listen(config.port, () => { console.log(`Server is running at http://localhost:${config.port}`); });
