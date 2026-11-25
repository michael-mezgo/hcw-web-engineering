import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { createDatabase, createPool } from './db.js';
import {
  createDrizzleBearRepository,
  createDrizzleCommentRepository,
  createDrizzleHealthCheck,
  createDrizzleUserRepository,
} from './repositories/drizzle.js';

// Invalid environment: print the reasons only (no stack trace) and stop.
let config: ReturnType<typeof loadConfig>;
try {
  config = loadConfig();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const pool = createPool(config.DATABASE_URL, config.DB_POOL_MAX, (err) => {
  app.log.error({ err }, 'idle database client failed');
});

const db = createDatabase(pool);

const app = await buildApp(config, {
  bears: createDrizzleBearRepository(db),
  comments: createDrizzleCommentRepository(db),
  health: createDrizzleHealthCheck(db),
  users: createDrizzleUserRepository(db),
});

try {
  await app.listen({ port: config.PORT, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
