import { Pool } from 'pg';

export function createPool(
  connectionString: string,
  max: number,
  onError: (err: Error) => void
): Pool {
  const pool = new Pool({
    connectionString,
    // Upper limit; must stay below Postgres max_connections
    max,
    // Close connections that nobody used for 60 s.
    idleTimeoutMillis: 60_000,
    connectionTimeoutMillis: 3_000,
  });

  pool.on('error', onError);

  return pool;
}
