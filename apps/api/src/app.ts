import { randomUUID } from 'node:crypto';
import { STATUS_CODES } from 'node:http';

import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';

import { HttpError, NotFoundError, ValidationError } from './errors.js';
import { bearRoutes } from './routes/bears.js';
import { commentRoutes } from './routes/comments.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
  });

  // Every response carries the request id (generated or taken from the request).
  app.addHook('onRequest', async (request, reply) => {
    void reply.header('x-request-id', request.id);
  });

  app.setNotFoundHandler(async (request) => {
    throw new NotFoundError(`Route ${request.method} ${request.url}`);
  });

  // The one place that turns any error into RFC 9457 Problem Details.
  app.setErrorHandler((error: FastifyError | HttpError, request, reply) => {
    const status =
      error instanceof HttpError
        ? error.status
        : error.statusCode !== undefined &&
            error.statusCode >= 400 &&
            error.statusCode < 500
          ? error.statusCode
          : 500;

    // The real cause goes to the log (with reqId), never to the client.
    (status >= 500 ? request.log.error : request.log.warn).call(
      request.log,
      { err: error },
      'request failed'
    );

    const detail =
      error instanceof HttpError
        ? error.detail
        : status < 500
          ? error.message
          : 'Internal Server Error';

    return reply
      .code(status)
      .type('application/problem+json')
      .send({
        type: 'about:blank',
        title:
          error instanceof HttpError
            ? error.title
            : (STATUS_CODES[status] ?? 'Error'),
        status,
        detail,
        instance: `urn:request:${request.id}`,
        ...(error instanceof ValidationError && { errors: error.errors }),
      });
  });

  app.get('/health', async () => ({
    status: 'ok',
    version: process.env.APP_VERSION ?? 'dev',
    uptime: Math.round(process.uptime()),
  }));

  void app.register(bearRoutes);
  void app.register(commentRoutes);

  // Only for demonstrating the 500 path; off unless explicitly enabled.
  if (process.env.ENABLE_DEBUG_ROUTES === '1') {
    app.get('/api/debug/provoke', async () => {
      throw new Error('Provoked 500 (secret internal detail)');
    });
  }

  return app;
}
