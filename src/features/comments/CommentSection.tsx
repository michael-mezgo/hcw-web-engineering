import type { JSX } from 'react';

export default function CommentSection(): JSX.Element {
  return (
    <section className="comments">
      <div className="show-hide">Show comment</div>

      <div className="comment-wrapper">
        <h3>Add comment</h3>
        <form className="comment-form">
          <div className="flex-pair">
            Your name:
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="flex-pair">
            Your comment:
            <input
              type="text"
              name="comment"
              id="comment"
              placeholder="Enter your comment"
              required
            />
          </div>
          <div>
            <input type="submit" value="Submit comment" />
          </div>
        </form>
        <h3>Comments</h3>
        <ul className="comment-container">
          <li>
            <p>Bob Fossil</p>
            <p>
              Oh I am so glad you taught me all about the big brown angry
              guys...
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
