import type { FastifyPluginAsync } from 'fastify';

import { NotFoundError } from '../errors.js';
import { refs } from '../openapi.js';
import { BearId, BearsQuerySchema } from '../schemas/bear.js';
import type { Repositories } from '../repositories/types.js';
import { parseOrThrow } from '../validate.js';

export const bearRoutes: FastifyPluginAsync<Repositories> = async (
  app,
  { bears }
) => {
  app.get(
    '/api/bears',
    {
      schema: {
        tags: ['bears'],
        summary: 'List all bears, optionally filtered by name (?q=)',
        response: {
          200: { type: 'array', items: refs.bear },
          400: refs.problem,
        },
      },
    },
    async (request) =>
      await bears.list(parseOrThrow(BearsQuerySchema, request.query).q)
  );

  app.get<{ Params: { id: string } }>(
    '/api/bears/:id',
    {
      schema: {
        tags: ['bears'],
        summary: 'Get one bear by its slug',
        response: {
          200: refs.bear,
          400: refs.problem,
          404: refs.problem,
        },
      },
    },
    async (request) => {
      const id = parseOrThrow(BearId, request.params.id, '/id');
      const bear = await bears.findById(id);

      if (bear === undefined) {
        throw new NotFoundError('Bear');
      }

      return bear;
    }
  );
};
