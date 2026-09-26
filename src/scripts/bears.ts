const baseUrl = 'https://en.wikipedia.org/w/api.php';
const title = 'List_of_ursids';

interface Bear {
  name: string;
  binomial: string;
  image: string | null;
  range: string;
}

interface WikiParseResponse {
  error?: { info?: string };
  parse?: { wikitext?: { '*'?: string } };
}

function isWikiParseResponse(data: unknown): data is WikiParseResponse {
  return typeof data === 'object' && data !== null;
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

function isWikiImageLookupResponse(
  data: unknown
): data is WikiImageLookupResponse {
  return typeof data === 'object' && data !== null;
}

export async function extractBears(wikitext: string): Promise<void> {
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

      // Collecting one promise per row (instead of rendering inside each
      // .then) keeps the array in wikitext/row order; Promise.all below
      // preserves that order regardless of which fetch resolves first.
      bearPromises.push(buildBear(name, binomial, rangeMatch, fileName));
    });
  });

  const bears = await Promise.all(bearPromises);
  const moreBears = document.querySelector('.more_bears');
  const fragment = document.createDocumentFragment();

  bears.forEach((bear) => {
    fragment.appendChild(renderBearCard(bear));
  });
  moreBears?.appendChild(fragment);
}

async function buildBear(
  name: string,
  binomial: string,
  rangeMatch: RegExpMatchArray | null,
  filename: string | null | undefined
): Promise<Bear> {
  let imageUrl = null;
  if (filename !== null && filename !== undefined && filename !== '') {
    try {
      imageUrl = await verifyImageLoads(await fetchImageUrl(filename));
    } catch (error) {
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

// Confirms the browser can actually decode the image at `url` before we use
// it, so a broken/404 image URL falls back to the placeholder instead of
// being rendered as a dead <img>.
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

function renderBearCard(bear: Bear): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'bear';

  const img = document.createElement('img');
  img.style.width = '200px';
  img.style.height = 'auto';

  if (bear.image !== null && bear.image !== undefined && bear.image !== '') {
    img.src = bear.image;
    img.alt = 'Image of ' + bear.name;
    card.appendChild(img);
  } else {
    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.srcset = '/placeholder.avif';
    source.type = 'image/avif';
    img.src = '/placeholder.jpg';
    img.alt = 'No image available for ' + bear.name;
    picture.appendChild(source);
    picture.appendChild(img);
    card.appendChild(picture);
  }

  const name = document.createElement('p');
  const boldName = document.createElement('b');
  boldName.textContent = bear.name;
  name.appendChild(boldName);
  name.appendChild(document.createTextNode(' (' + bear.binomial + ')'));

  const range = document.createElement('p');
  range.textContent = 'Range: ' + bear.range;

  card.appendChild(name);
  card.appendChild(range);
  return card;
}

async function fetchImageUrl(fileName: string): Promise<string> {
  const imageParams = {
    action: 'query',
    titles: 'File:' + fileName,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
    origin: '*',
  };

  const url = baseUrl + '?' + new URLSearchParams(imageParams).toString();
  const response = await fetch(url);
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

  if (imageUrl === undefined || imageUrl === '') {
    throw new Error('No image found for ' + fileName);
  }
  return imageUrl;
}

export async function loadBears(): Promise<void> {
  const params = {
    action: 'parse',
    page: title,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*',
  };

  try {
    const response = await fetch(
      baseUrl + '?' + new URLSearchParams(params).toString()
    );

    if (!response.ok) {
      throw new Error(
        'Bear list request failed with status ' + response.status
      );
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

    await extractBears(wikitext);
  } catch (err) {
    console.error('Failed to load bears:', err);
    showBearsError(
      "We couldn't load the bear list right now. Please try again later."
    );
    throw err;
  }
}

function showBearsError(message: string): void {
  const moreBears = document.querySelector('.more_bears');
  if (moreBears === null) return;
  const notice = document.createElement('p');
  notice.className = 'bears-error';
  notice.textContent = message;
  moreBears.appendChild(notice);
}
