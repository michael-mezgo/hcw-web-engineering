import type { JSX } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBearsState } from '../features/bears/BearsContext';
import BearImage from '../features/bears/BearImage';

export default function BearDetailPage(): JSX.Element {
  const { id } = useParams();
  const state = useBearsState();

  if (state.status === 'loading') {
    return (
      <main>
        <p role="status">Loading bear…</p>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main>
        <p className="bears-error" role="alert">
          {state.message}
        </p>
        <Link to="/">Back to all bears</Link>
      </main>
    );
  }

  const bear =
    state.status === 'success'
      ? state.bears.find((candidate) => candidate.id === id)
      : undefined;

  if (bear === undefined) {
    return (
      <main>
        <h2>Bear not found</h2>
        <p>There is no bear with the id &quot;{id}&quot;.</p>
        <Link to="/">Back to all bears</Link>
      </main>
    );
  }

  return (
    <main>
      <article>
        <h2>{bear.name}</h2>
        <BearImage bear={bear} width={300} />
        <p>
          <b>Scientific name:</b> {bear.binomial}
        </p>
        <p>
          <b>Range:</b> {bear.range}
        </p>
        <Link to="/">Back to all bears</Link>
      </article>
    </main>
  );
}
