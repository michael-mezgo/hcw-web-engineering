import { useState, type FormEvent, type JSX } from 'react';

import { API_BASE_URL, checkResponseOk, errorMessage } from '../api-error';

export default function RegisterPage(): JSX.Element {
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');

  async function register(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fields.get('email'),
          password: fields.get('password'),
        }),
      });
      await checkResponseOk(response);
      form.reset();
      setRegistered(true);
    } catch (err) {
      setError(errorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article>
      <h2>Register</h2>
      {registered ? (
        <p role="status">Your account has been created.</p>
      ) : (
        <form
          className="comment-form"
          onSubmit={(event) => {
            void register(event);
          }}
        >
          <div className="flex-pair">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex-pair">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-describedby="password-hint"
              minLength={12}
              required
            />
          </div>
          <p id="password-hint">Use at least 12 characters.</p>
          {error !== '' && <p role="alert">{error}</p>}
          <div>
            <input type="submit" value="Register" disabled={submitting} />
          </div>
        </form>
      )}
    </article>
  );
}
