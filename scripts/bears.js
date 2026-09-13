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
                ? fetchImageUrl(fileName).catch(function() { return null; })
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
        return res.json();
    }).then(function(data) {
        var pages = data.query.pages;
        var page = Object.values(pages)[0];
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
        .then(function(res) { return res.json(); })
        .then(function(data) {
            return extractBears(data.parse.wikitext['*']);
        });
}