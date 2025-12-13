// .env.local を優先、なければ .env を使用

import { existsSync } from "node:fs";
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// .env.local があれば優先的に読み込む（ローカル開発用）
if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
