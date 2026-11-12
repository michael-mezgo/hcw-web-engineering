import type { JSX } from 'react';
import { useSearchQuery } from './SearchContext';
import { splitByQuery } from './splitByQuery';

interface HighlightProps {
  text: string;
}

export default function Highlight({ text }: HighlightProps): JSX.Element {
  const query = useSearchQuery();

  return (
    <>
      {splitByQuery(text, query).map((segment, index) =>
        segment.isMatch ? (
          <mark key={index} className="highlight">
            {segment.text}
          </mark>
        ) : (
          segment.text
        )
      )}
    </>
  );
}
