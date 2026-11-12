import type { FastifyPluginAsync } from 'fastify';

import { NotFoundError } from '../errors.js';
import { BearId } from '../schemas/bear.js';
import { CommentId, CreateCommentSchema } from '../schemas/comment.js';
import { getBearById } from '../services/bear-service.js';
import {
  addComment,
  deleteComment,
  listComments,
} from '../services/comment-service.js';
import { parseOrThrow } from '../validate.js';

async function requireBear(rawId: string): Promise<string> {
  const id = parseOrThrow(BearId, rawId, '/id');

  if ((await getBearById(id)) === undefined) {
    throw new NotFoundError('Bear');
  }

  return id;
}

export const commentRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { id: string } }>(
    '/api/bears/:id/comments',
    async (request) => listComments(await requireBear(request.params.id))
  );

  app.post<{ Params: { id: string } }>(
    '/api/bears/:id/comments',
    async (request, reply) => {
      // Validate the body before the (slower) bear lookup.
      parseOrThrow(BearId, request.params.id, '/id');
      const body = parseOrThrow(CreateCommentSchema, request.body);
      const comment = addComment(await requireBear(request.params.id), body);

      return await reply
        .code(201)
        .header('Location', `/api/comments/${comment.id}`)
        .send(comment);
    }
  );

  app.delete<{ Params: { commentId: string } }>(
    '/api/comments/:commentId',
    async (request, reply) => {
      const commentId = parseOrThrow(
        CommentId,
        request.params.commentId,
        '/commentId'
      );

      if (!deleteComment(commentId)) {
        throw new NotFoundError('Comment');
      }

      return await reply.code(204).send();
    }
  );
};
