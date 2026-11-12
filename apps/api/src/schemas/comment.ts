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
