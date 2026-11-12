import { API_BASE_URL, checkResponseOk } from '../../api-error';
import type { Bear } from './types';

// The browser only talks to our own API (Backend for Frontend).
export async function loadBears(signal: AbortSignal): Promise<Bear[]> {
  const response = await fetch(`${API_BASE_URL}/api/bears`, { signal });

  await checkResponseOk(response);

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Unexpected bear list response');
  }

  // The API validates every bear with zod before sending it.
  return data as Bear[];
}
