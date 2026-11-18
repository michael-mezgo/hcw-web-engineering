import type { FastifyPluginAsync } from 'fastify';

import type { Database } from '../db.js';
import { NotFoundError } from '../errors.js';
import { refs } from '../openapi.js';
import { BearId } from '../schemas/bear.js';
import { getBearById, getBears } from '../services/bear-service.js';
import { parseOrThrow } from '../validate.js';

export const bearRoutes: FastifyPluginAsync<{
  db: Database;
}> = async (app, { db }) => {
  app.get(
    '/api/bears',
    {
      schema: {
        tags: ['bears'],
        summary: 'List all bears',
        response: {
          200: { type: 'array', items: refs.bear },
        },
      },
    },
    async () => await getBears(db)
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
      const bear = await getBearById(db, id);

      if (bear === undefined) {
        throw new NotFoundError('Bear');
      }

      return bear;
    }
  );
};
