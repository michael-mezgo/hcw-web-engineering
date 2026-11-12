import { useEffect, useState } from 'react';
import { loadBears } from './api';
import type { Bear } from './types';

export type BearsState =
  | { status: 'loading' }
  | { status: 'success'; bears: Bear[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

export function useBears(): BearsState {
  const [state, setState] = useState<BearsState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    const load = async (): Promise<void> => {
      try {
        const bears = await loadBears(controller.signal);
        if (controller.signal.aborted) return;
        setState(
          bears.length === 0
            ? { status: 'empty' }
            : { status: 'success', bears }
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Failed to load bears:', error);
        setState({
          status: 'error',
          message:
            "We couldn't load the bear list right now. Please try again later.",
        });
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, []);

  return state;
}
