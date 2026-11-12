import type { FastifyPluginAsync } from 'fastify';

import { BearId } from '../schemas/bear.js';
import { getBearById, getBears } from '../services/bear-service.js';

import { replyUpstreamError } from './reply-upstream-error.js';

export const bearRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/bears', async (_request, reply) => {
    try {
      return await getBears();
    } catch (error: unknown) {
      return await replyUpstreamError(reply, error);
    }
  });

  app.get<{ Params: { id: string } }>(
    '/api/bears/:id',
    async (request, reply) => {
      const id = BearId.safeParse(request.params.id);

      if (!id.success) {
        return await reply.code(400).send({ error: 'Invalid bear id' });
      }

      try {
        const bear = await getBearById(id.data);

        if (bear === undefined) {
          return await reply.code(404).send({ error: 'Bear not found' });
        }

        return bear;
      } catch (error: unknown) {
        return await replyUpstreamError(reply, error);
      }
    }
  );
};
