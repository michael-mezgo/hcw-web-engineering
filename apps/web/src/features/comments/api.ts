import { API_BASE_URL, checkResponseOk } from '../../api-error';
import type { Comment, CommentPage } from './types';

// Comments live in our own API, per bear.
export async function loadComments(
  bearId: string,
  signal: AbortSignal,
  cursor: string | null = null
): Promise<CommentPage> {
  const query = cursor === null ? '' : `?cursor=${encodeURIComponent(cursor)}`;
  const response = await fetch(
    `${API_BASE_URL}/api/bears/${encodeURIComponent(bearId)}/comments${query}`,
    { signal }
  );

  await checkResponseOk(response);

  return (await response.json()) as CommentPage;
}

export async function createComment(
  bearId: string,
  author: string,
  text: string
): Promise<Comment> {
  const response = await fetch(
    `${API_BASE_URL}/api/bears/${encodeURIComponent(bearId)}/comments`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text }),
    }
  );

  await checkResponseOk(response);

  return (await response.json()) as Comment;
}

export async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/comments/${encodeURIComponent(commentId)}`,
    { method: 'DELETE', credentials: 'include' }
  );

  await checkResponseOk(response);
}
