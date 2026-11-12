export interface TextSegment {
  text: string;
  isMatch: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Splits `text` into alternating non-matching and matching segments
// (case-insensitive). An empty query yields the whole text as one segment.
export function splitByQuery(text: string, query: string): TextSegment[] {
  if (query === '') return [{ text, isMatch: false }];

  // A capture group makes split() keep the matches: they end up at odd indexes.
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  return parts
    .map((part, index) => ({ text: part, isMatch: index % 2 === 1 }))
    .filter((segment) => segment.text !== '');
}
