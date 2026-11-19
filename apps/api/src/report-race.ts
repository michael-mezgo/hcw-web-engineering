import { eq } from 'drizzle-orm';

import { loadConfig } from './config.js';
import { createDatabase, createPool } from './db.js';
import { comments } from './schema.js';

// Sends 50 reports for one comment at the same time and checks the final count.
const REPORTS = 50;
const API_URL = process.env.API_URL ?? 'http://localhost:3000';

// "npm run race:reports -- naive" uses the broken version (needs
// ENABLE_DEBUG_ROUTES=1), without argument the fixed route is used.
const naive = process.argv[2] === 'naive';
const reportPath = (id: string): string =>
  naive
    ? `/api/debug/comments/${id}/report-naive`
    : `/api/comments/${id}/report`;

const pool = createPool(loadConfig().DATABASE_URL, 1, (err) => {
  console.error('database client failed', err);
});

try {
  const db = createDatabase(pool);

  // A fresh comment, so the count starts at 0.
  const created = await fetch(`${API_URL}/api/bears/u-arctos/comments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ author: 'Race script', text: 'Report me' }),
  });
  const { id } = (await created.json()) as { id: string };

  // No await inside the loop: all 50 requests are on their way at once.
  await Promise.all(
    Array.from(
      { length: REPORTS },
      async () => await fetch(`${API_URL}${reportPath(id)}`, { method: 'POST' })
    )
  );

  const [row] = await db.select().from(comments).where(eq(comments.id, id));

  console.log(
    `${naive ? 'Naive' : 'Fixed'} version: sent ${REPORTS} reports, report_count is ${row.reportCount}.`
  );
  console.log(
    row.reportCount === REPORTS
      ? 'OK: no report was lost.'
      : `LOST UPDATES: ${REPORTS - row.reportCount} reports are missing.`
  );
} catch (err) {
  console.error('Race script failed:', err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
