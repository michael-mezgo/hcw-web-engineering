import type { FastifyPluginAsync } from 'fastify';

import { NotFoundError } from '../errors.js';
import { BearId } from '../schemas/bear.js';
import { getBearById, getBears } from '../services/bear-service.js';
import { parseOrThrow } from '../validate.js';

export const bearRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/bears', async () => await getBears());

  app.get<{ Params: { id: string } }>('/api/bears/:id', async (request) => {
    const id = parseOrThrow(BearId, request.params.id, '/id');
    const bear = await getBearById(id);

    if (bear === undefined) {
      throw new NotFoundError('Bear');
    }

    return bear;
  });
};
