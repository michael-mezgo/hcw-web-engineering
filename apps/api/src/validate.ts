import type { z } from 'zod';

import { ValidationError } from './errors.js';

// Parses with zod and turns issues into the `errors` array of the problem.
export function parseOrThrow<S extends z.ZodType>(
  schema: S,
  data: unknown,
  root = ''
): z.output<S> {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  throw new ValidationError(
    result.error.issues.map((issue) => ({
      pointer: root + issue.path.map((part) => `/${String(part)}`).join(''),
      message: issue.message,
    }))
  );
}
