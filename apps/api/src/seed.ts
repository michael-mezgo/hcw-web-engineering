import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

import { loadConfig } from './config.js';
import { createPool } from './db.js';
import { bears } from './schema.js';
import { fetchBears } from './upstream/wikipedia-bears.js';

let config: ReturnType<typeof loadConfig>;
try {
  config = loadConfig();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const pool = createPool(config.DATABASE_URL, 1, (err) => {
  console.error('database client failed', err);
});

try {
  const fetched = await fetchBears({
    baseUrl: config.WIKIPEDIA_BASE_URL,
    userAgent: config.USER_AGENT,
  });

  await drizzle(pool)
    .insert(bears)
    .values(fetched)
    .onConflictDoUpdate({
      target: bears.id,
      // "excluded" is the row that was rejected by the conflict, i.e. the new data.
      set: {
        name: sql`excluded.name`,
        binomial: sql`excluded.binomial`,
        imageUrl: sql`excluded.image_url`,
        range: sql`excluded.range`,
        fetchedAt: sql`now()`,
      },
    });

  console.log(`Seeded ${fetched.length} bears.`);
} catch (err) {
  console.error('Seeding failed:', err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
