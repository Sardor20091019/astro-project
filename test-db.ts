// test-db.ts
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { DB } from './backend/src/database/types';

dotenv.config();

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

async function main() {
  console.log("Connecting to database via Kysely...");
  try {
    // Let's test with 'Photo' table which we know exists
    const result = await db
      .selectFrom('Photo')
      .select((eb) => eb.fn.count('id').as('count'))
      .executeTakeFirst();
      
    console.log("SUCCESS! Count of photos in Neon:", result?.count ?? 0);
  } catch (e) {
    console.error("FAILED to query:", e);
  } finally {
    await db.destroy();
  }
}

main();