import { z } from 'zod';

import { UpstreamError } from '../errors.js';
import { BearSchema, type Bear } from '../schemas/bear.js';
import { fetchBearWikitext, fetchImageUrl } from '../upstream/wikipedia.js';

interface ParsedBear {
  id: string;
  name: string;
  binomial: string;
  range: string;
  fileName: string | null;
}

export async function getBears(): Promise<Bear[]> {
  const wikitext = await fetchBearWikitext();
  const parsedBears = parseBears(wikitext);

  // Never answer with an empty list when the upstream gave us nothing usable.
  if (parsedBears.length === 0) {
    throw new UpstreamError('Wikipedia page did not contain any bears');
  }

  const bears = await Promise.all(parsedBears.map(withImageUrl));
  const result = z.array(BearSchema).safeParse(bears);

  if (!result.success) {
    throw new UpstreamError('Parsed bear data failed validation');
  }

  return result.data;
}

export async function getBearById(id: string): Promise<Bear | undefined> {
  const bears = await getBears();

  return bears.find((bear) => bear.id === id);
}

async function withImageUrl(bear: ParsedBear): Promise<unknown> {
  const { fileName, ...rest } = bear;
  let imageUrl: string | null = null;

  if (fileName !== null && fileName !== '') {
    try {
      imageUrl = await fetchImageUrl(fileName);
    } catch (error: unknown) {
      // A missing image must not hide the bear itself.
      console.warn(`Could not load image for ${bear.name}:`, error);
    }
  }

  return { ...rest, imageUrl };
}

function parseBears(wikitext: string): ParsedBear[] {
  const seenBinomials = new Set<string>();
  const bears: ParsedBear[] = [];

  for (const table of wikitext.split('{{Species table/end}}')) {
    for (const row of table.split('{{Species table/row')) {
      const nameMatch = row.match(/\|name=\[\[(.*?)]]/);
      const binomialMatch = row.match(/\|binomial=(.*?)\n/);
      const imageMatch = row.match(/\|image=(.*?)(?:\s\||\n)/);
      const rangeMatch = row.match(/\|range=(.*?)(?:\s\||\n)/);

      const name = nameMatch?.[1]?.trim();
      const binomial = binomialMatch?.[1];

      if (name === undefined || binomial === undefined) continue;
      if (seenBinomials.has(binomial)) continue;
      seenBinomials.add(binomial);

      bears.push({
        id: toSlug(binomial),
        name,
        binomial,
        range: rangeMatch?.[1]?.trim() ?? 'Unknown',
        fileName: imageMatch?.[1]?.trim().replace('File:', '') ?? null,
      });
    }
  }

  return bears;
}

// URL-safe identifier: "Ursus arctos" -> "ursus-arctos".
function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
