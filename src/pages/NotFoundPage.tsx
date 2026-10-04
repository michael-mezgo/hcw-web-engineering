import type { JSX } from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage(): JSX.Element {
  return (
    <main>
      <h2>Page not found</h2>
      <Link to="/">Back to the start page</Link>
    </main>
  );
}
