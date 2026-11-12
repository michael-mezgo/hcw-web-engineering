import type { FastifyPluginAsync } from 'fastify';

import { BearId } from '../schemas/bear.js';
import { CommentId, CreateCommentSchema } from '../schemas/comment.js';
import { getBearById } from '../services/bear-service.js';
import {
  addComment,
  deleteComment,
  listComments,
} from '../services/comment-service.js';

import { replyUpstreamError } from './reply-upstream-error.js';

export const commentRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { id: string } }>(
    '/api/bears/:id/comments',
    async (request, reply) => {
      const id = BearId.safeParse(request.params.id);

      if (!id.success) {
        return await reply.code(400).send({ error: 'Invalid bear id' });
      }

      try {
        if ((await getBearById(id.data)) === undefined) {
          return await reply.code(404).send({ error: 'Bear not found' });
        }
      } catch (error: unknown) {
        return await replyUpstreamError(reply, error);
      }

      return listComments(id.data);
    }
  );

  app.post<{ Params: { id: string } }>(
    '/api/bears/:id/comments',
    async (request, reply) => {
      const id = BearId.safeParse(request.params.id);

      if (!id.success) {
        return await reply.code(400).send({ error: 'Invalid bear id' });
      }

      const body = CreateCommentSchema.safeParse(request.body);

      if (!body.success) {
        return await reply
          .code(400)
          .send({ error: 'Invalid comment', details: body.error.issues });
      }

      try {
        if ((await getBearById(id.data)) === undefined) {
          return await reply.code(404).send({ error: 'Bear not found' });
        }
      } catch (error: unknown) {
        return await replyUpstreamError(reply, error);
      }

      const comment = addComment(id.data, body.data);

      return await reply
        .code(201)
        .header('Location', `/api/comments/${comment.id}`)
        .send(comment);
    }
  );

  app.delete<{ Params: { commentId: string } }>(
    '/api/comments/:commentId',
    async (request, reply) => {
      const commentId = CommentId.safeParse(request.params.commentId);

      if (!commentId.success) {
        return await reply.code(400).send({ error: 'Invalid comment id' });
      }

      if (!deleteComment(commentId.data)) {
        return await reply.code(404).send({ error: 'Comment not found' });
      }

      return await reply.code(204).send();
    }
  );
};
