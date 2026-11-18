import { sql } from 'drizzle-orm';

import { loadConfig } from './config.js';
import { createDatabase, createPool } from './db.js';

// 8 bears x 12,500 comments = 100,000 comments
const COMMENTS_PER_BEAR = 12_500;

const pool = createPool(loadConfig().DATABASE_URL, 1, (err) => {
  console.error('database client failed', err);
});

try {
  const db = createDatabase(pool);

  // generate_series makes the comment numbers 1 to 12,500. The CROSS JOIN
  // pairs every bear with every number, so each pair becomes one comment.
  // Comment number 1 is the newest, number 2 is one second older, and so on.
  const result = await db.execute(sql`
    INSERT INTO comments (bear_id, author, text, created_at)
    SELECT bears.id,
           'Seed user',
           'Seeded comment ' || comment_number,
           now() - comment_number * interval '1 second'
    FROM bears
    CROSS JOIN generate_series(1, ${COMMENTS_PER_BEAR}) AS comment_number
  `);

  await db.execute(sql`ANALYZE comments`);

  console.log(`Seeded ${result.rowCount ?? 0} comments.`);
} catch (err) {
  console.error('Seeding comments failed:', err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
