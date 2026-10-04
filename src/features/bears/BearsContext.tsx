import { createContext, useContext, type JSX, type ReactNode } from 'react';
import { useBears, type BearsState } from './useBears';

const BearsContext = createContext<BearsState | null>(null);

// Loads the bears once for the whole app, so the list page and the detail
// page share the same data instead of requesting it twice.
export function BearsProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const state = useBears();
  return <BearsContext value={state}>{children}</BearsContext>;
}

export function useBearsState(): BearsState {
  const state = useContext(BearsContext);
  if (state === null) {
    throw new Error('useBearsState must be used inside a <BearsProvider>');
  }
  return state;
}
