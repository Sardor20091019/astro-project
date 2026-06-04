import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

// 1. Initialize the pool
const pool = new Pool({
  connectionString,
  // Removing complex SSL settings here; 
  // let the connection string handle the SSL mode.
});

// 2. Create the adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// 3. Pass the adapter to PrismaClient
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}