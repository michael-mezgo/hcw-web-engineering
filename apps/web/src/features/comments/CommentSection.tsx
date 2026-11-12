import { useState, type JSX } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import type { Comment } from './types';

const initialComments: Comment[] = [
  {
    id: 'initial-bob-fossil',
    name: 'Bob Fossil',
    text: 'Oh I am so glad you taught me all about the big brown angry guys...',
  },
];

export default function CommentSection(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const addComment = (name: string, text: string): void => {
    setComments((prev) => [...prev, { id: crypto.randomUUID(), name, text }]);
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
          <CommentList comments={comments} />
        </div>
      )}
    </section>
  );
}
