import { randomUUID } from 'node:crypto';

import Fastify, { type FastifyInstance } from 'fastify';

import { bearRoutes } from './routes/bears.js';
import { commentRoutes } from './routes/comments.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
  });

  app.get('/health', async () => ({
    status: 'ok',
    version: process.env.APP_VERSION ?? 'dev',
    uptime: Math.round(process.uptime()),
  }));

  void app.register(bearRoutes);
  void app.register(commentRoutes);

  return app;
}
