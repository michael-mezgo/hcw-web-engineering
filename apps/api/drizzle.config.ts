import { defineConfig } from 'drizzle-kit';

// No database credentials on purpose: `generate` only compares the schema
// with the existing migrations. Migrations are applied by our own script
// (db:migrate), which reads DATABASE_URL through the zod-validated config.
export default defineConfig({
  dialect: 'postgresql',
  // Where the tables are described in TypeScript.
  schema: './src/schema.ts',
  // Generated SQL migrations; committed to git.
  out: './drizzle',
});
