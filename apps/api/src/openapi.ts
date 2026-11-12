import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';

import { BearSchema } from './schemas/bear.js';
import { CommentSchema, CreateCommentSchema } from './schemas/comment.js';
import { ProblemSchema } from './schemas/problem.js';

// The OpenAPI document is generated from the same zod schemas that validate
// the data, so contract and implementation cannot drift apart silently.
function fromZod(
  schema: z.ZodType,
  io: 'input' | 'output' = 'output'
): Record<string, unknown> {
  const json: Record<string, unknown> = z.toJSONSchema(schema, {
    target: 'draft-7',
    io,
  });
  delete json.$schema;
  return json;
}

export const refs = {
  bear: { $ref: 'Bear#' },
  comment: { $ref: 'Comment#' },
  problem: { $ref: 'Problem#' },
} as const;

export const createCommentBody = fromZod(CreateCommentSchema, 'input');

export async function registerOpenApi(app: FastifyInstance): Promise<void> {
  app.addSchema({ $id: 'Bear', ...fromZod(BearSchema) });
  app.addSchema({ $id: 'Comment', ...fromZod(CommentSchema) });
  app.addSchema({ $id: 'Problem', ...fromZod(ProblemSchema) });

  // Schemas only document the routes; the zod parsing in the handlers stays
  // the single validation path so errors keep the Problem Details format.
  app.setValidatorCompiler(() => (data) => ({ value: data }));

  await app.register(swagger, {
    refResolver: {
      // Name components after their $id (Bear, Comment, Problem).
      buildLocalReference: (json, _baseUri, _fragment, index) =>
        typeof json.$id === 'string' ? json.$id : `def-${index}`,
    },
    openapi: {
      openapi: '3.1.0',
      info: { title: 'Bears API', version: process.env.APP_VERSION ?? 'dev' },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/api/docs' });
}
