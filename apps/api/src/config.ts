import { z } from 'zod';

const CorsOrigin = z.string().refine((value) => {
  const url = URL.parse(value);
  return (
    url !== null &&
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    value === url.origin
  );
}, 'must be an exact HTTP(S) origin');

// All environment variables are validated once, at startup. Anything wrong
// stops the process immediately with a readable message (fail fast).
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_VERSION: z.string().min(1).default('dev'),
  // Comma-separated allow-list of origins for CORS.
  CORS_ORIGINS: z
    .string()
    .default(
      'http://localhost:4173,http://localhost:5173,http://localhost:8080'
    )
    .transform((value) =>
      value.trim() === '' ? [] : value.split(',').map((origin) => origin.trim())
    )
    .pipe(z.array(CorsOrigin)),
  SESSION_SECRET: z.string().min(32),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(1000).default(5),
  ENABLE_DEBUG_ROUTES: z.enum(['0', '1']).default('0'),
  WIKIPEDIA_BASE_URL: z.url().default('https://en.wikipedia.org'),
  USER_AGENT: z
    .string()
    .min(1)
    .default('BearApp/0.1 (university coursework; Node.js fetch)'),
  // No default on purpose: there is no sensible fallback for the database.
  DATABASE_URL: z.url().refine((value) => /^postgres(ql)?:\/\//.test(value), {
    message: 'must start with postgres:// or postgresql://',
  }),
  // Upper limit of the connection pool
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
});

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = EnvSchema.safeParse(env);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    // Only variable names and reasons - never the values (secrets).
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }

  return result.data;
}
