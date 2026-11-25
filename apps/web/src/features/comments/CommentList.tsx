import type { JSX } from 'react';
import type { User } from '../layout/SessionControls';
import Highlight from '../search/Highlight';
import type { Comment } from './types';

interface CommentListProps {
  comments: Comment[];
  user: User | null;
  onDelete: (commentId: string) => void;
}

export default function CommentList({
  comments,
  user,
  onDelete,
}: CommentListProps): JSX.Element {
  return (
    <ul className="comment-container">
      {comments.map((comment) => (
        <li key={comment.id}>
          <p>
            <Highlight text={comment.author} />
          </p>
          <p>
            <Highlight text={comment.text} />
          </p>
          {user !== null &&
            (user.role === 'moderator' || user.id === comment.authorId) && (
              <button
                type="button"
                className="delete-button"
                onClick={() => {
                  onDelete(comment.id);
                }}
              >
                Delete
              </button>
            )}
        </li>
      ))}
    </ul>
  );
}
