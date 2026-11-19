import { randomUUID } from 'node:crypto';

import type { Bear } from '../schemas/bear.js';
import { type Comment, toCommentPage } from '../schemas/comment.js';
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
    list: async (q) =>
      bears.filter((bear) =>
        bear.name.toLowerCase().includes((q ?? '').toLowerCase())
      ),
    findById: async (id) => bears.find((bear) => bear.id === id),
  };
};

// Same order as the database: created_at, then id.
const key = ({ createdAt, id }: { createdAt: string; id: string }): string =>
  createdAt + id;

export const createMemoryCommentRepository = (): CommentRepository => {
  const comments = new Map<string, Comment>();

  return {
    listByBear: async (bearId, { limit, after }) => {
      const rows = [...comments.values()]
        .filter((comment) => comment.bearId === bearId)
        .sort((a, b) => key(a).localeCompare(key(b)))
        .filter((comment) => after === undefined || key(comment) > key(after))
        .slice(0, limit + 1);

      return toCommentPage(rows, limit);
    },

    create: async (bearId, input) => {
      const comment: Comment = {
        id: randomUUID(),
        bearId,
        ...input,
        createdAt: new Date().toISOString(),
        reportCount: 0,
        hiddenAt: null,
      };

      comments.set(comment.id, comment);

      return comment;
    },

    findById: async (id) => comments.get(id),

    saveReports: async (id, reports) => {
      const comment = comments.get(id);

      if (comment === undefined) {
        return undefined;
      }

      const updated = { ...comment, ...reports };

      comments.set(id, updated);

      return updated;
    },

    addReport: async (id, hideAt) => {
      const comment = comments.get(id);

      if (comment === undefined) {
        return undefined;
      }

      const reportCount = comment.reportCount + 1;
      const updated = {
        ...comment,
        reportCount,
        hiddenAt:
          reportCount >= hideAt
            ? (comment.hiddenAt ?? new Date().toISOString())
            : comment.hiddenAt,
      };

      comments.set(id, updated);

      return updated;
    },

    delete: async (id) => comments.delete(id),
  };
};

export const createMemoryHealthCheck = (): HealthCheck => ({
  ping: async () => {},
});
