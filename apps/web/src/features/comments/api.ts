import { API_BASE_URL, checkResponseOk } from '../../api-error';
import type { Comment } from './types';

// Comments live in our own API, per bear.
export async function loadComments(
  bearId: string,
  signal: AbortSignal
): Promise<Comment[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/bears/${encodeURIComponent(bearId)}/comments`,
    { signal }
  );

  await checkResponseOk(response);

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Unexpected comments response');
  }

  return data as Comment[];
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
    { method: 'DELETE' }
  );

  await checkResponseOk(response);
}
