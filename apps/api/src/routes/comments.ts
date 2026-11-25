import type { FastifyPluginAsync } from 'fastify';

import { HttpError, NotFoundError } from '../errors.js';
import { createCommentBody, refs } from '../openapi.js';
import { BearId } from '../schemas/bear.js';
import {
  CommentId,
  CommentsQuerySchema,
  CreateCommentSchema,
} from '../schemas/comment.js';
import type {
  BearRepository,
  CommentRepository,
  Repositories,
} from '../repositories/types.js';
import type { AuthUser } from '../schemas/auth.js';
import { createReportService } from '../services/reports.js';
import { requireSessionUser } from '../services/session.js';
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

async function requireDeletePermission(
  comments: CommentRepository,
  commentId: string,
  user: AuthUser
): Promise<void> {
  const comment = await comments.findById(commentId);
  if (comment === undefined) {
    throw new NotFoundError('Comment');
  }

  if (user.role !== 'moderator' && comment.authorId !== user.id) {
    throw new HttpError(
      403,
      'Forbidden',
      'You may only delete your own comments.'
    );
  }
}

export const commentRoutes: FastifyPluginAsync<Repositories> = async (
  app,
  { bears, comments, users }
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
      // The handler checks the session before validating the body with Zod.
      attachValidation: true,
      schema: {
        tags: ['comments'],
        summary: 'Create a comment (201 with Location header)',
        body: createCommentBody,
        response: {
          201: refs.comment,
          400: refs.problem,
          401: refs.problem,
          404: refs.problem,
        },
      },
    },
    async (request, reply) => {
      const user = await requireSessionUser(users, request.headers.cookie);
      // Validate the body before the (slower) bear lookup.
      parseOrThrow(BearId, request.params.id, '/id');
      const body = parseOrThrow(CreateCommentSchema, request.body);
      const comment = await comments.create(
        await requireBear(bears, request.params.id),
        body,
        user.id
      );

      return await reply
        .code(201)
        .header('Location', `/api/comments/${comment.id}`)
        .send(comment);
    }
  );

  const reports = createReportService(comments);

  app.post<{ Params: { commentId: string } }>(
    '/api/comments/:commentId/report',
    {
      schema: {
        tags: ['comments'],
        summary: 'Report a comment (hidden after 3 reports)',
        response: {
          200: refs.comment,
          400: refs.problem,
          404: refs.problem,
        },
      },
    },
    async (request) =>
      await reports.report(
        parseOrThrow(CommentId, request.params.commentId, '/commentId')
      )
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
          401: refs.problem,
          403: refs.problem,
          404: refs.problem,
        },
      },
    },
    async (request, reply) => {
      const user = await requireSessionUser(users, request.headers.cookie);
      const commentId = parseOrThrow(
        CommentId,
        request.params.commentId,
        '/commentId'
      );

      await requireDeletePermission(comments, commentId, user);
      if (!(await comments.delete(commentId))) {
        throw new NotFoundError('Comment');
      }

      return await reply.code(204).send();
    }
  );
};
