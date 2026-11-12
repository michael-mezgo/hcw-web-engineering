import type { Comment } from './types';

// Comments live in our own API, per bear.
export async function loadComments(
  bearId: string,
  signal: AbortSignal
): Promise<Comment[]> {
  const response = await fetch(
    `/api/bears/${encodeURIComponent(bearId)}/comments`,
    { signal }
  );

  if (!response.ok) {
    throw new Error('Comments request failed with status ' + response.status);
  }

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
    `/api/bears/${encodeURIComponent(bearId)}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text }),
    }
  );

  if (!response.ok) {
    throw new Error(
      'Creating the comment failed with status ' + response.status
    );
  }

  return (await response.json()) as Comment;
}

export async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(
    `/api/comments/${encodeURIComponent(commentId)}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(
      'Deleting the comment failed with status ' + response.status
    );
  }
}
