import type { FastifyPluginAsync } from 'fastify';

import { NotFoundError } from '../errors.js';
import { createCommentBody, refs } from '../openapi.js';
import { BearId } from '../schemas/bear.js';
import {
  CommentId,
  CommentsQuerySchema,
  CreateCommentSchema,
} from '../schemas/comment.js';
import type { BearRepository, Repositories } from '../repositories/types.js';
import { parseOrThrow } from '../validate.js';

async function requireBear(
  bears: BearRepository,
  rawId: string
): Promise<string> {
  const id = parseOrThrow(BearId, rawId, '/id');

  if ((await bears.findById(id)) === undefined) {
    throw new NotFoundError('Bear');
  }

  return id;
}

export const commentRoutes: FastifyPluginAsync<Repositories> = async (
  app,
  { bears, comments }
) => {
  app.get<{ Params: { id: string } }>(
    '/api/bears/:id/comments',
    {
      schema: {
        tags: ['comments'],
        summary:
          'List the comments of a bear (cursor pagination: ?limit, ?cursor)',
        response: {
          200: refs.commentPage,
          400: refs.problem,
          404: refs.problem,
        },
      },
    },
    async (request) => {
      const { limit, cursor } = parseOrThrow(
        CommentsQuerySchema,
        request.query
      );

      return await comments.listByBear(
        await requireBear(bears, request.params.id),
        { limit, after: cursor }
      );
    }
  );

  app.post<{ Params: { id: string } }>(
    '/api/bears/:id/comments',
    {
      schema: {
        tags: ['comments'],
        summary: 'Create a comment (201 with Location header)',
        body: createCommentBody,
        response: {
          201: refs.comment,
          400: refs.problem,
          404: refs.problem,
        },
      },
    },
    async (request, reply) => {
      // Validate the body before the (slower) bear lookup.
      parseOrThrow(BearId, request.params.id, '/id');
      const body = parseOrThrow(CreateCommentSchema, request.body);
      const comment = await comments.create(
        await requireBear(bears, request.params.id),
        body
      );

      return await reply
        .code(201)
        .header('Location', `/api/comments/${comment.id}`)
        .send(comment);
    }
  );

  app.delete<{ Params: { commentId: string } }>(
    '/api/comments/:commentId',
    {
      schema: {
        tags: ['comments'],
        summary: 'Delete a comment',
        response: {
          204: { type: 'null' },
          400: refs.problem,
          404: refs.problem,
        },
      },
    },
    async (request, reply) => {
      const commentId = parseOrThrow(
        CommentId,
        request.params.commentId,
        '/commentId'
      );

      if (!(await comments.delete(commentId))) {
        throw new NotFoundError('Comment');
      }

      return await reply.code(204).send();
    }
  );
};
