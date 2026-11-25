import { useEffect, useState, type FormEvent, type JSX } from 'react';
import { useMatch } from 'react-router-dom';

import { API_BASE_URL, checkResponseOk, errorMessage } from '../../api-error';

interface User {
  email: string;
  role: string;
}

async function auth(path: string, options?: RequestInit): Promise<Response> {
  return await fetch(`${API_BASE_URL}/api/auth/${path}`, {
    credentials: 'include',
    ...options,
  });
}

export default function SessionControls(): JSX.Element | null {
  const onRegisterPage = useMatch('/register') !== null;
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession(): Promise<void> {
      try {
        const response = await auth('me', { signal: controller.signal });
        if (response.status === 401) return;
        await checkResponseOk(response);
        const account = (await response.json()) as User;
        if (!controller.signal.aborted) setUser(account);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(errorMessage(err, 'Could not check your session.'));
        }
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }

    void loadSession();
    return () => {
      controller.abort();
    };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError('');

    try {
      const response = await auth('login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fields.get('email'),
          password: fields.get('password'),
        }),
      });
      await checkResponseOk(response);
      setUser((await response.json()) as User);
    } catch (err) {
      setError(errorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  async function logout(): Promise<void> {
    setBusy(true);
    setError('');

    try {
      await checkResponseOk(await auth('logout', { method: 'POST' }));
      setUser(null);
    } catch (err) {
      setError(errorMessage(err, 'Logout failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  if (onRegisterPage && user === null) return null;

  return (
    <article>
      {user !== null ? (
        <>
          <p>
            {user.email} · {user.role}
          </p>
          <button
            className="show-hide"
            disabled={busy}
            onClick={() => {
              void logout();
            }}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <h2>Log in</h2>
          <form
            className="comment-form"
            onSubmit={(event) => {
              void login(event);
            }}
          >
            <div className="flex-pair">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </div>
            <div className="flex-pair">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <input type="submit" value="Log in" disabled={busy} />
          </form>
        </>
      )}
      {error !== '' && <p role="alert">{error}</p>}
    </article>
  );
}
