import { eq } from 'drizzle-orm';

import type { Database } from '../db.js';
import { bears } from '../schema.js';
import type { Bear } from '../schemas/bear.js';

const bearColumns = {
  id: bears.id,
  name: bears.name,
  binomial: bears.binomial,
  imageUrl: bears.imageUrl,
  range: bears.range,
};

export async function getBears(db: Database): Promise<Bear[]> {
  return await db.select(bearColumns).from(bears).orderBy(bears.name);
}

export async function getBearById(
  db: Database,
  id: string
): Promise<Bear | undefined> {
  const [bear] = await db
    .select(bearColumns)
    .from(bears)
    .where(eq(bears.id, id));

  return bear;
}
