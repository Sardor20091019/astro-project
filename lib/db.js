import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
export const db = new Kysely({
    dialect: new PostgresDialect({
        pool,
    }),
});
//# sourceMappingURL=db.js.map