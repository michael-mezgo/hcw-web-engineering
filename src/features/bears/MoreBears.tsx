import type { JSX } from 'react';
import Highlight from '../search/Highlight';
import BearList from './BearList';
import { useBears, type BearsState } from './useBears';

function renderBears(state: BearsState): JSX.Element {
  switch (state.status) {
    case 'loading':
      return <p role="status">Loading bears…</p>;
    case 'success':
      return <BearList bears={state.bears} />;
    case 'empty':
      return <p>No bears found.</p>;
    case 'error':
      return (
        <p className="bears-error" role="alert">
          {state.message}
        </p>
      );
  }
}

export default function MoreBears(): JSX.Element {
  const state = useBears();

  return (
    <section className="more_bears">
      <h3>
        <Highlight text="More Bears" />
      </h3>
      {renderBears(state)}
    </section>
  );
}
