import { z } from 'zod';

export const CommentId = z.uuid();

// Body of POST /api/bears/:id/comments.
export const CreateCommentSchema = z.object({
  author: z.string().trim().min(1).max(100),
  text: z.string().trim().min(1).max(1000),
});

export type CreateComment = z.infer<typeof CreateCommentSchema>;

export const CommentSchema = z.object({
  id: CommentId,
  bearId: z.string(),
  author: z.string(),
  text: z.string(),
  createdAt: z.iso.datetime(),
});

export type Comment = z.infer<typeof CommentSchema>;

export interface CommentCursor {
  createdAt: string;
  id: string;
}

const encodeCursor = ({ createdAt, id }: Comment): string =>
  Buffer.from(JSON.stringify({ createdAt, id })).toString('base64url');

export const CommentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(
          Buffer.from(value, 'base64url').toString()
        ) as unknown;
      } catch {
        ctx.issues.push({
          code: 'custom',
          message: 'Invalid cursor',
          input: value,
        });
        return z.NEVER;
      }
    })
    .pipe(z.object({ createdAt: z.iso.datetime(), id: z.uuid() }))
    .optional(),
});

export const CommentPageSchema = z.object({
  items: z.array(CommentSchema),
  nextCursor: z.string().nullable(), // null = last page
});

export type CommentPage = z.infer<typeof CommentPageSchema>;

// Repositories load limit + 1 rows: the extra row only tells that another page exists.
export const toCommentPage = (rows: Comment[], limit: number): CommentPage => {
  const items = rows.slice(0, limit);
  const last = items.at(-1);

  return {
    items,
    nextCursor:
      rows.length > limit && last !== undefined ? encodeCursor(last) : null,
  };
};
