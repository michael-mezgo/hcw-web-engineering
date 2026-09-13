export function extractBears(wikitext) {
    var speciesTables = wikitext.split('{{Species table/end}}');
    var seenBinomials = new Set();
    var bearPromises = [];

    speciesTables.forEach(function(table) {
        var rows = table.split('{{Species table/row');
        rows.forEach(function(row) {
            var nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            var binomialMatch = row.match(/\|binomial=(.*?)\n/);
            var imageMatch = row.match(/\|image=(.*?)(?:\s\||\n)/);
            var rangeMatch = row.match(/\|range=(.*?)(?:\s\||\n)/);

            if (!nameMatch || !binomialMatch) return;
            if (seenBinomials.has(binomialMatch[1])) return;
            seenBinomials.add(binomialMatch[1]);

            var fileName = imageMatch ? imageMatch[1].trim().replace('File:', '') : null;
            var imageUrlPromise = fileName
                ? fetchImageUrl(fileName)
                    .then(function(imageUrl) { return verifyImageLoads(imageUrl); })
                    .catch(function(err) {
                        console.warn('Could not load image for ' + nameMatch[1] + ':', err);
                        return null;
                    })
                : Promise.resolve(null);

            // Collecting one promise per row (instead of rendering inside each
            // .then) keeps the array in wikitext/row order; Promise.all below
            // preserves that order regardless of which fetch resolves first.
            bearPromises.push(imageUrlPromise.then(function(imageUrl) {
                return {
                    name: nameMatch[1],
                    binomial: binomialMatch[1],
                    image: imageUrl,
                    range: rangeMatch ? rangeMatch[1].trim() : "Unknown"
                };
            }));
        });
    });

    return Promise.all(bearPromises).then(function(bears) {
        var moreBears = document.querySelector('.more_bears');
        var fragment = document.createDocumentFragment();
        bears.forEach(function(bear) {
            fragment.appendChild(renderBearCard(bear));
        });
        moreBears.appendChild(fragment);
    });
}

// Confirms the browser can actually decode the image at `url` before we use
// it, so a broken/404 image URL falls back to the placeholder instead of
// being rendered as a dead <img>.
function verifyImageLoads(url) {
    if (!url) return Promise.resolve(null);
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() { resolve(url); };
        img.onerror = function() { resolve(null); };
        img.src = url;
    });
}

function renderBearCard(bear) {
    var card = document.createElement('div');
    card.className = 'bear';

    var img = document.createElement('img');
    img.style.width = '200px';
    img.style.height = 'auto';

    if (bear.image) {
        img.src = bear.image;
        img.alt = 'Image of ' + bear.name;
        card.appendChild(img);
    } else {
        var picture = document.createElement('picture');
        var source = document.createElement('source');
        source.srcset = 'media/placeholder.avif';
        source.type = 'image/avif';
        img.src = 'media/placeholder.jpg';
        img.alt = 'No image available for ' + bear.name;
        picture.appendChild(source);
        picture.appendChild(img);
        card.appendChild(picture);
    }

    var name = document.createElement('p');
    var boldName = document.createElement('b');
    boldName.textContent = bear.name;
    name.appendChild(boldName);
    name.appendChild(document.createTextNode(' (' + bear.binomial + ')'));

    var range = document.createElement('p');
    range.textContent = 'Range: ' + bear.range;

    card.appendChild(name);
    card.appendChild(range);
    return card;
}

function fetchImageUrl(fileName) {
    var imageParams = {
        action: "query",
        titles: "File:" + fileName,
        prop: "imageinfo",
        iiprop: "url",
        format: "json",
        origin: "*"
    };

    var url = baseUrl + "?" + new URLSearchParams(imageParams).toString();
    return fetch(url).then(function(res) {
        if (!res.ok) {
            throw new Error('Image lookup request failed with status ' + res.status);
        }
        return res.json();
    }).then(function(data) {
        if (!data.query || !data.query.pages) {
            throw new Error('Unexpected image lookup response for ' + fileName);
        }
        var pages = data.query.pages;
        var page = Object.values(pages)[0];

        if (!page || !page.imageinfo || !page.imageinfo[0] || !page.imageinfo[0].url) {
            throw new Error('No image found for ' + fileName);
        }
        return page.imageinfo[0].url;
    });
}

var baseUrl = "https://en.wikipedia.org/w/api.php";
var title = "List_of_ursids";

export function loadBears() {
    var params = {
        action: "parse",
        page: title,
        prop: "wikitext",
        section: 3,
        format: "json",
        origin: "*"
    };

    return fetch(baseUrl + "?" + new URLSearchParams(params).toString())
        .then(function(res) {
            if (!res.ok) {
                throw new Error('Bear list request failed with status ' + res.status);
            }
            return res.json();
        })
        .then(function(data) {
            if (data.error) {
                throw new Error(data.error.info || 'Wikipedia API returned an error');
            }
            if (!data.parse || !data.parse.wikitext || !data.parse.wikitext['*']) {
                throw new Error('Bear list response was missing expected content');
            }
            return extractBears(data.parse.wikitext['*']);
        })
        .catch(function(err) {
            console.error('Failed to load bears:', err);
            showBearsError('We couldn\'t load the bear list right now. Please try again later.');
            throw err;
        });
}

function showBearsError(message) {
    var moreBears = document.querySelector('.more_bears');
    if (!moreBears) return;
    var notice = document.createElement('p');
    notice.className = 'bears-error';
    notice.textContent = message;
    moreBears.appendChild(notice);
}