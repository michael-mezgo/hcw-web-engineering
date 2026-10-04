import type { JSX } from 'react';
import Highlight from '../search/Highlight';
import type { Comment } from './types';

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({
  comments,
}: CommentListProps): JSX.Element {
  return (
    <ul className="comment-container">
      {comments.map((comment) => (
        <li key={comment.id}>
          <p>
            <Highlight text={comment.name} />
          </p>
          <p>
            <Highlight text={comment.text} />
          </p>
        </li>
      ))}
    </ul>
  );
}
