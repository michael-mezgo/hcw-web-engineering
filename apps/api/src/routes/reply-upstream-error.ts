import type { FastifyReply } from 'fastify';

import { UpstreamError, UpstreamTimeoutError } from '../errors.js';

// Translates upstream failures into 504/502; everything else stays a 500.
export async function replyUpstreamError(
  reply: FastifyReply,
  error: unknown
): Promise<FastifyReply> {
  if (error instanceof UpstreamTimeoutError) {
    return await reply.code(504).send({ error: 'Wikipedia request timed out' });
  }

  if (error instanceof UpstreamError) {
    return await reply.code(502).send({ error: 'Wikipedia unavailable' });
  }

  throw error;
}
