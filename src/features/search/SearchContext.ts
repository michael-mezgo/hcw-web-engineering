import { createContext, useContext } from 'react';

// The current search query. Components inside <article> read it to highlight
// matching text without the query being passed through every component.
export const SearchQueryContext = createContext('');

export function useSearchQuery(): string {
  return useContext(SearchQueryContext);
}
