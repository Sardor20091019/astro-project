import { defineConfig } from '@prisma/config';

export default defineConfig({
  migrations: {
    seed: "node prisma/seed.mjs",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:sardor_09@localhost:5432/astrospectrum?schema=public",
  },
});
