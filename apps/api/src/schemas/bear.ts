import { z } from 'zod';

// Stable slug of the binomial name, e.g. "ursus-arctos".
export const BearId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const BearSchema = z.object({
  id: BearId,
  name: z.string().min(1),
  binomial: z.string().min(1),
  imageUrl: z.url().nullable(),
  range: z.string(),
});

export type Bear = z.infer<typeof BearSchema>;
