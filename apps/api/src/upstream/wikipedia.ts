import { z } from 'zod';

import { UpstreamError, UpstreamTimeoutError } from '../errors.js';

const UPSTREAM_TIMEOUT_MS = 5000;

const WikiParseResponse = z.object({
  parse: z.object({
    wikitext: z.object({
      '*': z.string().min(1),
    }),
  }),
});

// A missing file has no `imageinfo`, which is valid and means "no image".
const WikiImageResponse = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({
        imageinfo: z.array(z.object({ url: z.url() })).optional(),
      })
    ),
  }),
});

export async function fetchBearWikitext(): Promise<string> {
  const url = createWikipediaUrl();

  url.searchParams.set('action', 'parse');
  url.searchParams.set('page', 'List_of_ursids');
  url.searchParams.set('prop', 'wikitext');
  url.searchParams.set('section', '3');
  url.searchParams.set('format', 'json');

  const result = WikiParseResponse.safeParse(await fetchWikipediaJson(url));

  if (!result.success) {
    throw new UpstreamError('Wikipedia returned an unexpected response');
  }

  return result.data.parse.wikitext['*'];
}

export async function fetchImageUrl(fileName: string): Promise<string | null> {
  const url = createWikipediaUrl();

  url.searchParams.set('action', 'query');
  url.searchParams.set('titles', `File:${fileName}`);
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url');
  url.searchParams.set('format', 'json');

  const result = WikiImageResponse.safeParse(await fetchWikipediaJson(url));

  if (!result.success) {
    throw new UpstreamError('Wikipedia returned an unexpected image response');
  }

  const page = Object.values(result.data.query.pages)[0];

  return page?.imageinfo?.[0]?.url ?? null;
}

function createWikipediaUrl(): URL {
  const baseUrl = process.env.WIKIPEDIA_BASE_URL ?? 'https://en.wikipedia.org';

  return new URL('/w/api.php', baseUrl);
}

async function fetchWikipediaJson(url: URL): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        // Wikimedia's User-Agent policy: name the app and a way to contact us.
        'User-Agent':
          process.env.USER_AGENT ??
          'BearApp/0.1 (university coursework; Node.js fetch)',
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new UpstreamTimeoutError('Wikipedia request timed out');
    }

    throw new UpstreamError('Wikipedia could not be reached');
  }

  if (!response.ok) {
    throw new UpstreamError(`Wikipedia returned ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    throw new UpstreamError('Wikipedia returned invalid JSON');
  }
}
