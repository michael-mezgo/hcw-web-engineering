import type { Bear } from './types';

// The browser only talks to our own API (Backend for Frontend).
export async function loadBears(signal: AbortSignal): Promise<Bear[]> {
  const response = await fetch('/api/bears', { signal });

  if (!response.ok) {
    throw new Error('Bear list request failed with status ' + response.status);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Unexpected bear list response');
  }

  // The API validates every bear with zod before sending it.
  return data as Bear[];
}
