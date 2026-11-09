import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI does not read .env.local by default, so load it explicitly.
loadEnv({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations use the direct (session) connection, not the pooler.
    url: process.env.DIRECT_URL ?? "",
  },
});
