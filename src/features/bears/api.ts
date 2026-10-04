import type { Bear } from './types';

const baseUrl = 'https://en.wikipedia.org/w/api.php';
const title = 'List_of_ursids';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Optional properties may be absent, but if present they must be valid.
function isOptional(value: unknown, isValid: (v: unknown) => boolean): boolean {
  return value === undefined || isValid(value);
}

interface WikiParseResponse {
  error?: { info?: string };
  parse?: { wikitext?: { '*'?: string } };
}

function isWikiParseResponse(data: unknown): data is WikiParseResponse {
  if (!isRecord(data)) return false;
  return (
    isOptional(
      data.error,
      (error) => isRecord(error) && isOptional(error.info, isString)
    ) &&
    isOptional(
      data.parse,
      (parse) =>
        isRecord(parse) &&
        isOptional(
          parse.wikitext,
          (wikitext) =>
            isRecord(wikitext) && isOptional(wikitext['*'], isString)
        )
    )
  );
}

interface WikiImageLookupResponse {
  query?: {
    pages?: Record<
      string,
      {
        imageinfo?: Array<{ url?: string }>;
      }
    >;
  };
}

function isImagePage(page: unknown): boolean {
  return (
    isRecord(page) &&
    isOptional(
      page.imageinfo,
      (imageInfo) =>
        Array.isArray(imageInfo) &&
        imageInfo.every(
          (entry) => isRecord(entry) && isOptional(entry.url, isString)
        )
    )
  );
}

function isWikiImageLookupResponse(
  data: unknown
): data is WikiImageLookupResponse {
  if (!isRecord(data)) return false;
  return isOptional(
    data.query,
    (query) =>
      isRecord(query) &&
      isOptional(
        query.pages,
        (pages) => isRecord(pages) && Object.values(pages).every(isImagePage)
      )
  );
}

async function extractBears(
  wikitext: string,
  signal: AbortSignal
): Promise<Bear[]> {
  const speciesTables = wikitext.split('{{Species table/end}}');
  const seenBinomials = new Set<string>();
  const bearPromises: Array<Promise<Bear>> = [];

  speciesTables.forEach((table) => {
    const rows = table.split('{{Species table/row');
    rows.forEach((row) => {
      const nameMatch = row.match(/\|name=\[\[(.*?)]]/);
      const binomialMatch = row.match(/\|binomial=(.*?)\n/);
      const imageMatch = row.match(/\|image=(.*?)(?:\s\||\n)/);
      const rangeMatch = row.match(/\|range=(.*?)(?:\s\||\n)/);

      if (nameMatch?.[1] === undefined || binomialMatch?.[1] === undefined)
        return;
      const binomial = binomialMatch[1];
      if (seenBinomials.has(binomial)) return;
      seenBinomials.add(binomial);
      const name = nameMatch[1].trim();

      const fileName =
        imageMatch !== null ? imageMatch[1]?.trim().replace('File:', '') : null;

      bearPromises.push(
        buildBear(name, binomial, rangeMatch, fileName, signal)
      );
    });
  });

  return await Promise.all(bearPromises);
}

async function buildBear(
  name: string,
  binomial: string,
  rangeMatch: RegExpMatchArray | null,
  filename: string | null | undefined,
  signal: AbortSignal
): Promise<Bear> {
  let imageUrl = null;
  if (filename !== null && filename !== undefined && filename !== '') {
    try {
      imageUrl = await verifyImageLoads(await fetchImageUrl(filename, signal));
    } catch (error) {
      if (signal.aborted) throw error;
      console.warn('Could not load image for ' + name + ':', error);
    }
  }

  return {
    name,
    binomial,
    image: imageUrl,
    range: rangeMatch?.[1]?.trim() ?? 'Unknown',
  };
}

async function verifyImageLoads(url: string | null): Promise<string | null> {
  if (url === null || url === undefined || url === '')
    return await Promise.resolve(null);
  return await new Promise<string | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(url);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

async function fetchImageUrl(
  fileName: string,
  signal: AbortSignal
): Promise<string> {
  const imageParams = {
    action: 'query',
    titles: 'File:' + fileName,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
    origin: '*',
  };

  const url = baseUrl + '?' + new URLSearchParams(imageParams).toString();
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(
      'Image lookup request failed with status ' + response.status
    );
  }

  const data: unknown = await response.json();
  if (!isWikiImageLookupResponse(data) || data.query?.pages === undefined) {
    throw new Error('Unexpected image lookup response for ' + fileName);
  }

  const page = Object.values(data.query.pages)[0];
  const imageUrl = page?.imageinfo?.[0]?.url;

  if (typeof imageUrl !== 'string' || imageUrl === '') {
    throw new Error('No image found for ' + fileName);
  }
  return imageUrl;
}

export async function loadBears(signal: AbortSignal): Promise<Bear[]> {
  const params = {
    action: 'parse',
    page: title,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*',
  };

  const response = await fetch(
    baseUrl + '?' + new URLSearchParams(params).toString(),
    { signal }
  );

  if (!response.ok) {
    throw new Error('Bear list request failed with status ' + response.status);
  }

  const data: unknown = await response.json();

  if (!isWikiParseResponse(data)) {
    throw new Error('Unexpected bear list response');
  }
  if (data.error !== undefined) {
    throw new Error(data.error.info ?? 'Wikipedia API returned an error');
  }
  const wikitext = data.parse?.wikitext?.['*'];
  if (wikitext === undefined || wikitext === '') {
    throw new Error('Bear list response was missing expected content');
  }
  if (!wikitext.includes('{{Species table/row')) {
    throw new Error('Bear list response did not contain a species table');
  }

  return await extractBears(wikitext, signal);
}
