import { randomUUID } from 'node:crypto';

import type { Comment, CreateComment } from '../schemas/comment.js';

// In-memory store: comments are lost when the process stops (Playground 5
// replaces this with a database). A Map keeps insertion order.
const comments = new Map<string, Comment>();

export function listComments(bearId: string): Comment[] {
  return [...comments.values()].filter((comment) => comment.bearId === bearId);
}

export function addComment(bearId: string, input: CreateComment): Comment {
  const comment: Comment = {
    id: randomUUID(),
    bearId,
    author: input.author,
    text: input.text,
    createdAt: new Date().toISOString(),
  };

  comments.set(comment.id, comment);

  return comment;
}

// Returns false if there was no such comment.
export function deleteComment(commentId: string): boolean {
  return comments.delete(commentId);
}
