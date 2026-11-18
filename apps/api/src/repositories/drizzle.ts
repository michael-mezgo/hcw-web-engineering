import { asc, eq, getTableColumns, sql } from 'drizzle-orm';

import type { Database } from '../db.js';
import { bears, comments } from '../schema.js';
import type { Comment } from '../schemas/comment.js';
import type {
  BearRepository,
  CommentRepository,
  HealthCheck,
} from './types.js';

// All columns from the schema except fetchedAt (internal, not part of the API).
const { fetchedAt: _fetchedAt, ...bearColumns } = getTableColumns(bears);

export const createDrizzleBearRepository = (db: Database): BearRepository => ({
  list: async () =>
    await db.select(bearColumns).from(bears).orderBy(asc(bears.name)),

  findById: async (id) => {
    const [bear] = await db
      .select(bearColumns)
      .from(bears)
      .where(eq(bears.id, id));

    return bear;
  },
});

// The API sends createdAt as ISO string, the database gives a Date.
const toComment = (row: typeof comments.$inferSelect): Comment => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});

export const createDrizzleCommentRepository = (
  db: Database
): CommentRepository => ({
  listByBear: async (bearId) => {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.bearId, bearId))
      .orderBy(asc(comments.createdAt), asc(comments.id));

    return rows.map(toComment);
  },

  create: async (bearId, input) => {
    const [row] = await db
      .insert(comments)
      .values({ bearId, ...input })
      .returning();

    return toComment(row);
  },

  delete: async (id) => {
    const deleted = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });

    return deleted.length > 0;
  },
});

export const createDrizzleHealthCheck = (db: Database): HealthCheck => ({
  ping: async () => {
    await db.execute(sql`SELECT 1`);
  },
});
