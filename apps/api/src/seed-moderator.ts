import { argon2id, hash } from 'argon2';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { loadConfig } from './config.js';
import { createDatabase, createPool } from './db.js';
import { users } from './schema.js';

const email = 'moderator@example.com';
const password = z.string().min(12).safeParse(process.env.MODERATOR_PASSWORD);
if (!password.success) {
  console.error('Set MODERATOR_PASSWORD to at least 12 characters.');
  process.exit(1);
}

const pool = createPool(loadConfig().DATABASE_URL, 1, (err) => {
  console.error('database client failed', err);
});

try {
  const db = createDatabase(pool);
  const passwordHash = await hash(password.data, { type: argon2id });
  await db
    .insert(users)
    .values({ email, passwordHash, role: 'moderator' })
    .onConflictDoNothing({ target: users.email });

  const [account] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.email, email));

  if (account?.role !== 'moderator') {
    throw new Error(`${email} already belongs to a non-moderator account.`);
  }

  console.log(`Moderator available at ${email}.`);
} catch (err) {
  console.error('Seeding moderator failed:', err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
