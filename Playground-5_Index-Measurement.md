# Playground 5, Task 4: Does the index help?

We want to know how much the composite index on `comments (bear_id, created_at, id)` speeds up the query behind the paginated comment list. For this I compare `EXPLAIN (ANALYZE, BUFFERS)` of the same query on the same data, once with and once without the index.

## The query

First page of the comments of one bear. The API asks for the page size plus one (20 + 1) to learn whether a next page exists.

```sql
SELECT * FROM comments
WHERE bear_id = 'u-arctos'
ORDER BY created_at, id
LIMIT 21;
```

## Test data

- 100,000 comments from `npm run db:seed:comments -w apps/api`, spread evenly over the 8 bears (12,500 per bear).
- PostgreSQL 18 in Docker, default settings.
- The seed script runs `ANALYZE comments` at the end, so the planner knows the real table size.

## Steps to reproduce

All commands are run from the repository root. Migration `0001` already creates the index, so I measured with the index first, dropped it for the second measurement, and created it again afterwards.

```bash
# 1. start everything and fill the table
docker compose up --build -d
npm run db:seed:comments -w apps/api

# 2. check the table: created_at must be timestamp(3), the index must exist
docker compose exec db psql -U bears -d bears -c "\d comments"

# 3. measure WITH the index (3 runs)
docker compose exec db psql -U bears -d bears -c "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM comments WHERE bear_id = 'u-arctos' ORDER BY created_at, id LIMIT 21;"

# 4. drop the index, refresh the statistics, measure WITHOUT the index (3 runs)
docker compose exec db psql -U bears -d bears -c "DROP INDEX comments_bear_id_created_at_id_idx;" -c "ANALYZE comments;"
docker compose exec db psql -U bears -d bears -c "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM comments WHERE bear_id = 'u-arctos' ORDER BY created_at, id LIMIT 21;"

# 5. put the index back (db:migrate would not do it, 0001 is already recorded as applied)
docker compose exec db psql -U bears -d bears -c 'CREATE INDEX "comments_bear_id_created_at_id_idx" ON "comments" USING btree ("bear_id","created_at","id");' -c "ANALYZE comments;"
```

## Results at a glance

Median of three runs each.

| | Without index | With index |
|---|---|---|
| Strategy | read the whole table, filter, sort | walk the index, stop after 21 entries |
| Plan nodes | `Seq Scan` → `Sort` → `Limit` | `Index Scan` → `Limit` |
| Rows examined | 100,000 | 21 |
| 8 kB pages touched | 1,286 | 6 |
| Execution time | **5.202 ms** | **0.091 ms** |

All runs (ms): without index 5.700 / 5.202 / 5.178, with index 0.170 / 0.065 / 0.091. That is about **57× faster** and about **200× fewer pages**. The first run with the index was the slowest because three pages still had to be read from disk (`read=3`); afterwards everything came from the cache.

### Plan without the index

```
 Limit  (cost=2861.09..2861.14 rows=21 width=67) (actual time=5.181..5.183 rows=21.00 loops=1)
   Buffers: shared hit=1286
   ->  Sort  (cost=2861.09..2891.79 rows=12280 width=67) (actual time=5.180..5.181 rows=21.00 loops=1)
         Sort Key: created_at, id
         Sort Method: top-N heapsort  Memory: 30kB
         Buffers: shared hit=1286
         ->  Seq Scan on comments  (cost=0.00..2530.00 rows=12280 width=67) (actual time=0.007..3.995 rows=12500.00 loops=1)
               Filter: (bear_id = 'u-arctos'::text)
               Rows Removed by Filter: 87500
               Buffers: shared hit=1280
 Planning:
   Buffers: shared hit=97
 Planning Time: 0.385 ms
 Execution Time: 5.202 ms
```

### Plan with the index

```
 Limit  (cost=0.42..9.89 rows=21 width=67) (actual time=0.035..0.042 rows=21.00 loops=1)
   Buffers: shared hit=6
   ->  Index Scan using comments_bear_id_created_at_id_idx on comments  (cost=0.42..5659.86 rows=12553 width=67) (actual time=0.034..0.040 rows=21.00 loops=1)
         Index Cond: (bear_id = 'u-arctos'::text)
         Index Searches: 1
         Buffers: shared hit=6
 Planning:
   Buffers: shared hit=133
 Planning Time: 0.546 ms
 Execution Time: 0.091 ms
```

## What the plans tell us

1. **Without the index** the database has no way to reach the rows of one bear directly. It scans all 1,280 table pages, discards 87,500 rows that belong to other bears, and sorts the 12,500 remaining ones, only to keep the first 21. The effort depends on the table size, not on the page size.
2. **With the index** the entries are already sorted by `bear_id`, then `created_at`, then `id`. The database jumps to `u-arctos`, reads the next 21 entries in the right order and stops. No `Sort` node is needed.
3. **Why this column order:** `bear_id` is compared with `=`, so it goes first. `created_at, id` come next because they are both the sort order and the cursor condition `(created_at, id) > (…)`. An index starting with `created_at` could not jump to a single bear.
4. **Why `id` is in the index:** the cursor compares `(created_at, id)`. The earlier index from migration `0000` had only `bear_id, created_at`, so the tie-breaker was not covered; migration `0001` replaces it.
5. **The difference grows with the data.** The sequential scan gets slower with every additional row in the table, the index scan keeps reading about 21 entries. With 100,000 rows it is already a factor of about 57; with millions of rows the gap would be much larger.


> **Note on AI use:** This document was written with the help of an AI assistant (Claude Sonnet 5.5, via Claude Code). The measurements were run by me on my own machine; the AI structured the write-up and helped phrase the explanations.