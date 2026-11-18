import type { FastifyPluginAsync } from 'fastify';

import { NotFoundError } from '../errors.js';
import { createCommentBody, refs } from '../openapi.js';
import { BearId } from '../schemas/bear.js';
import { CommentId, CreateCommentSchema } from '../schemas/comment.js';
import { getBearById } from '../services/bear-service.js';
import {
  addComment,
  deleteComment,
  listComments,
} from '../services/comment-service.js';
import type { Database } from '../db.js';
import { parseOrThrow } from '../validate.js';

async function requireBear(db: Database, rawId: string): Promise<string> {
  const id = parseOrThrow(BearId, rawId, '/id');

  if ((await getBearById(db, id)) === undefined) {
    throw new NotFoundError('Bear');
  }

  return id;
}

export const commentRoutes: FastifyPluginAsync<{
  db: Database;
}> = async (app, { db }) => {
  app.get<{ Params: { id: string } }>(
    '/api/bears/:id/comments',
    {
      schema: {
        tags: ['comments'],
        summary: 'List the comments of a bear',
        response: {
          200: { type: 'array', items: refs.comment },
          400: refs.problem,
          404: refs.problem,
        },
      },
    },
    async (request) => listComments(await requireBear(db, request.params.id))
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
      const comment = addComment(
        await requireBear(db, request.params.id),
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

      if (!deleteComment(commentId)) {
        throw new NotFoundError('Comment');
      }

      return await reply.code(204).send();
    }
  );
};
