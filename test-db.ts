// test-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to database...");
  try {
    const count = await prisma.otpToken.count();
    console.log("SUCCESS! Count of tokens:", count);
  } catch (e) {
    console.error("FAILED to connect:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();