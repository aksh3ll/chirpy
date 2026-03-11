import { defineConfig } from "drizzle-kit";

process.loadEnvFile()

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export default defineConfig({
  schema: "src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: envOrThrow("DB_URL"),
  },
});
