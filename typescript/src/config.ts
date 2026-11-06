process.loadEnvFile()

import type { MigrationConfig } from "drizzle-orm/migrator";

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type APIConfig = {
  fileserverHits: number;
  platform: string;
  port: number;
  secret: string;
  polkaKey: string;
  db: DBConfig;
};

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

const config: APIConfig = {
  fileserverHits: 0,
  platform: envOrThrow("PLATFORM"),
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig,
  },
  port: parseInt(envOrThrow("PORT"), 10),
  secret: envOrThrow("SECRET"),
  polkaKey: envOrThrow("POLKA_KEY"),
};

export default config;
