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
  try {
    const photos = await db.selectFrom('Photo').select(['id', 'url']).limit(5).execute();
    console.log(photos);
  } catch (e) {
    console.error(e);
  } finally {
    await db.destroy();
  }
}
main();
