const baseUrl = "https://en.wikipedia.org/w/api.php";
const title = "List_of_ursids";

export async function extractBears(wikitext) {
    const speciesTables = wikitext.split('{{Species table/end}}');
    const seenBinomials = new Set();
    const bearPromises = [];

    speciesTables.forEach((table) => {
        const rows = table.split('{{Species table/row');
        rows.forEach((row) => {
            const nameMatch = row.match(/\|name=\[\[(.*?)]]/);
            const binomialMatch = row.match(/\|binomial=(.*?)\n/);
            const imageMatch = row.match(/\|image=(.*?)(?:\s\||\n)/);
            const rangeMatch = row.match(/\|range=(.*?)(?:\s\||\n)/);

            if (!nameMatch || !binomialMatch) return;
            if (seenBinomials.has(binomialMatch[1])) return;
            seenBinomials.add(binomialMatch[1]);

            const fileName = imageMatch ? imageMatch[1].trim().replace('File:', '') : null;

            // Collecting one promise per row (instead of rendering inside each
            // .then) keeps the array in wikitext/row order; Promise.all below
            // preserves that order regardless of which fetch resolves first.
            bearPromises.push(buildBear(nameMatch, binomialMatch, rangeMatch, fileName));
        });
    });

    const bears = await Promise.all(bearPromises);
    const moreBears = document.querySelector('.more_bears');
    const fragment = document.createDocumentFragment();

    bears.forEach((bear) => {
        fragment.appendChild(renderBearCard(bear));
    });
    moreBears.appendChild(fragment);
}

async function buildBear(nameMatch, binomialMatch, rangeMatch, filename) {
    let imageUrl = null;
    if (filename) {
        try {
            imageUrl = await verifyImageLoads(await fetchImageUrl(filename));
        } catch (error) {
            console.warn('Could not load image for ' + nameMatch[1] + ':', error);
        }
    }

    return {
        name: nameMatch[1],
        binomial: binomialMatch[1],
        image: imageUrl,
        range: rangeMatch ? rangeMatch[1].trim() : "Unknown"
    };
}

// Confirms the browser can actually decode the image at `url` before we use
// it, so a broken/404 image URL falls back to the placeholder instead of
// being rendered as a dead <img>.
function verifyImageLoads(url) {
    if (!url) return Promise.resolve(null);
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { resolve(url); };
        img.onerror = () => { resolve(null); };
        img.src = url;
    });
}

function renderBearCard(bear) {
    const card = document.createElement('div');
    card.className = 'bear';

    const img = document.createElement('img');
    img.style.width = '200px';
    img.style.height = 'auto';

    if (bear.image) {
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

async function fetchImageUrl(fileName) {
    const imageParams = {
        action: "query",
        titles: "File:" + fileName,
        prop: "imageinfo",
        iiprop: "url",
        format: "json",
        origin: "*"
    };

    const url = baseUrl + "?" + new URLSearchParams(imageParams).toString();
    const response = await fetch(url);
    if(!response.ok) {
        throw new Error('Image lookup request failed with status ' + response.status);
    }

    const data = await response.json();
    if (!data.query || !data.query.pages) {
        throw new Error('Unexpected image lookup response for ' + fileName);
    }

    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    if (!page || !page.imageinfo || !page.imageinfo[0] || !page.imageinfo[0].url) {
        throw new Error('No image found for ' + fileName);
    }
    return page.imageinfo[0].url;
}

export async function loadBears() {
    const params = {
        action: "parse",
        page: title,
        prop: "wikitext",
        section: 3,
        format: "json",
        origin: "*"
    };

    try {
        const response = await fetch(baseUrl + "?" + new URLSearchParams(params).toString());

        if (!response.ok) {
            throw new Error('Bear list request failed with status ' + response.status);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.info || 'Wikipedia API returned an error');
        }
        if (!data.parse || !data.parse.wikitext || !data.parse.wikitext['*']) {
            throw new Error('Bear list response was missing expected content');
        }

        return await extractBears(data.parse.wikitext['*']);
    } catch (err) {
        console.error('Failed to load bears:', err);
        showBearsError('We couldn\'t load the bear list right now. Please try again later.');
        throw err;
    }
}

function showBearsError(message) {
    const moreBears = document.querySelector('.more_bears');
    if (!moreBears) return;
    const notice = document.createElement('p');
    notice.className = 'bears-error';
    notice.textContent = message;
    moreBears.appendChild(notice);
}