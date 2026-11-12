import { useEffect, useState, type JSX } from 'react';
import { errorMessage } from '../../api-error';
import { createComment, deleteComment, loadComments } from './api';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import type { Comment } from './types';

interface CommentSectionProps {
  bearId: string;
}

export default function CommentSection({
  bearId,
}: CommentSectionProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const loaded = await loadComments(bearId, controller.signal);
        if (controller.signal.aborted) return;
        setComments(loaded);
        setError(null);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error('Failed to load comments:', loadError);
        setError(
          errorMessage(loadError, 'We could not load the comments right now.')
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [bearId]);

  // Resolves to true if the comment was saved, so the form knows to reset.
  const addComment = async (author: string, text: string): Promise<boolean> => {
    try {
      const created = await createComment(bearId, author, text);
      setComments((prev) => [...prev, created]);
      setError(null);
      return true;
    } catch (createError) {
      console.error('Failed to create comment:', createError);
      setError(
        errorMessage(
          createError,
          'We could not save your comment. Please try again.'
        )
      );
      return false;
    }
  };

  const removeComment = async (commentId: string): Promise<void> => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setError(null);
    } catch (deleteError) {
      console.error('Failed to delete comment:', deleteError);
      setError(
        errorMessage(
          deleteError,
          'We could not delete the comment. Please try again.'
        )
      );
    }
  };

  return (
    <section className="comments">
      <button
        type="button"
        className="show-hide"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        {isOpen ? 'Hide comments' : 'Show comments'}
      </button>

      {isOpen && (
        <div className="comment-wrapper">
          <h3>Add comment</h3>
          <CommentForm onAdd={addComment} />
          <h3>Comments</h3>
          {error !== null && (
            <p className="bears-error" role="alert">
              {error}
            </p>
          )}
          {isLoading ? (
            <p role="status">Loading comments…</p>
          ) : (
            <CommentList
              comments={comments}
              onDelete={(commentId) => {
                void removeComment(commentId);
              }}
            />
          )}
        </div>
      )}
    </section>
  );
}
