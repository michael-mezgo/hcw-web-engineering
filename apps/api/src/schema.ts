import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bears = pgTable('bears', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  binomial: text('binomial').notNull(),
  imageUrl: text('image_url'),
  range: text('range').notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bearId: text('bear_id')
      .notNull()
      .references(() => bears.id, { onDelete: 'cascade' }),
    author: text('author').notNull(),
    text: text('text').notNull(),
    // precision 3 = milliseconds like a JS Date, so the cursor matches the stored value exactly.
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    reportCount: integer('report_count').notNull().default(0),
    // null = visible, set when the comment reaches 3 reports
    hiddenAt: timestamp('hidden_at', { withTimezone: true, precision: 3 }),
  },
  // Cursor pagination: WHERE bear_id = ? AND (created_at, id) > (?, ?) ORDER BY created_at, id
  (table) => [
    index('comments_bear_id_created_at_id_idx').on(
      table.bearId,
      table.createdAt,
      table.id
    ),
  ]
);
