import { randomUUID } from 'node:crypto';

import type { Bear } from '../schemas/bear.js';
import type { Comment } from '../schemas/comment.js';
import type {
  BearRepository,
  CommentRepository,
  HealthCheck,
} from './types.js';

// In-memory implementations (Playground 4), used by the tests.
export const createMemoryBearRepository = (
  initial: Bear[] = []
): BearRepository => {
  const bears = [...initial].sort((a, b) => a.name.localeCompare(b.name));

  return {
    list: async () => [...bears],
    findById: async (id) => bears.find((bear) => bear.id === id),
  };
};

export const createMemoryCommentRepository = (): CommentRepository => {
  const comments = new Map<string, Comment>();

  return {
    listByBear: async (bearId) =>
      [...comments.values()].filter((comment) => comment.bearId === bearId),

    create: async (bearId, input) => {
      const comment: Comment = {
        id: randomUUID(),
        bearId,
        ...input,
        createdAt: new Date().toISOString(),
      };

      comments.set(comment.id, comment);

      return comment;
    },

    delete: async (id) => comments.delete(id),
  };
};

export const createMemoryHealthCheck = (): HealthCheck => ({
  ping: async () => {},
});
