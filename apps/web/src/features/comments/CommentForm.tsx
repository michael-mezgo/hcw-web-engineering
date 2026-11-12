import { useState, type FormEvent, type JSX } from 'react';

interface CommentFormProps {
  onAdd: (author: string, text: string) => Promise<boolean>;
}

export default function CommentForm({ onAdd }: CommentFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // Derived from the input state, so there is no second source of truth.
  const nameMissing = name.trim() === '';
  const textMissing = text.trim() === '';

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (nameMissing || textMissing) {
      setShowErrors(true);
      return;
    }

    // Keep the input if saving failed, so nothing the user typed is lost.
    if (await onAdd(name.trim(), text.trim())) {
      setName('');
      setText('');
      setShowErrors(false);
    }
  };

  return (
    <form
      className="comment-form"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      noValidate
    >
      <div className="flex-pair">
        <label htmlFor="name">Your name:</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Enter your name"
          value={name}
          aria-invalid={showErrors && nameMissing}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </div>
      {showErrors && nameMissing && <p role="alert">Please enter your name.</p>}
      <div className="flex-pair">
        <label htmlFor="comment">Your comment:</label>
        <input
          type="text"
          name="comment"
          id="comment"
          placeholder="Enter your comment"
          value={text}
          aria-invalid={showErrors && textMissing}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
      </div>
      {showErrors && textMissing && <p role="alert">Please enter a comment.</p>}
      <div>
        <input type="submit" value="Submit comment" />
      </div>
    </form>
  );
}
