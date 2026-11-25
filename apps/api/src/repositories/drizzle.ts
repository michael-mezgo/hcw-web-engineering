import { and, asc, eq, getTableColumns, ilike, sql } from 'drizzle-orm';

import type { Database } from '../db.js';
import { bears, comments, users } from '../schema.js';
import { type Comment, toCommentPage } from '../schemas/comment.js';
import type {
  BearRepository,
  CommentRepository,
  HealthCheck,
  UserRepository,
} from './types.js';

// All columns from the schema except fetchedAt (internal, not part of the API).
const { fetchedAt: _fetchedAt, ...bearColumns } = getTableColumns(bears);

export const createDrizzleBearRepository = (db: Database): BearRepository => ({
  list: async (q) =>
    await db
      .select(bearColumns)
      .from(bears)
      .where(q !== undefined ? ilike(bears.name, `%${q}%`) : undefined)
      .orderBy(asc(bears.name)),

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
  hiddenAt: row.hiddenAt?.toISOString() ?? null,
});

export const createDrizzleCommentRepository = (
  db: Database
): CommentRepository => ({
  listByBear: async (bearId, { limit, after }) => {
    const rows = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.bearId, bearId),
          after !== undefined
            ? sql`(${comments.createdAt}, ${comments.id}) > (${after.createdAt}::timestamptz, ${after.id}::uuid)`
            : undefined
        )
      )
      .orderBy(asc(comments.createdAt), asc(comments.id))
      .limit(limit + 1);

    return toCommentPage(rows.map(toComment), limit);
  },

  create: async (bearId, input) => {
    const [row] = await db
      .insert(comments)
      .values({ bearId, ...input })
      .returning();

    return toComment(row);
  },

  findById: async (id) => {
    const [row] = await db.select().from(comments).where(eq(comments.id, id));

    return row === undefined ? undefined : toComment(row);
  },

  saveReports: async (id, { reportCount, hiddenAt }) => {
    const [row] = await db
      .update(comments)
      .set({
        reportCount,
        hiddenAt: hiddenAt === null ? null : new Date(hiddenAt),
      })
      .where(eq(comments.id, id))
      .returning();

    return row === undefined ? undefined : toComment(row);
  },

  addReport: async (id, hideAt) => {
    // The database counts, not TypeScript: the row is locked during the UPDATE,
    // so concurrent reports wait for each other and none is lost.
    const [row] = await db
      .update(comments)
      .set({
        reportCount: sql`${comments.reportCount} + 1`,
        hiddenAt: sql`CASE WHEN ${comments.reportCount} + 1 >= ${hideAt}
          THEN coalesce(${comments.hiddenAt}, now())
          ELSE ${comments.hiddenAt} END`,
      })
      .where(eq(comments.id, id))
      .returning();

    return row === undefined ? undefined : toComment(row);
  },

  delete: async (id) => {
    const deleted = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });

    return deleted.length > 0;
  },
});

export const createDrizzleUserRepository = (db: Database): UserRepository => ({
  create: async (email, passwordHash) => {
    const rows = await db
      .insert(users)
      .values({ email, passwordHash })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });

    return rows.length > 0;
  },
});

export const createDrizzleHealthCheck = (db: Database): HealthCheck => ({
  ping: async () => {
    await db.execute(sql`SELECT 1`);
  },
});
