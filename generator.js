var fs = require('fs'), http = require('http'), child_process = require('child_process');

function request(url, callback) {
    http.get(url, function (response) {
        var body = '';
        response.on('data', function (data) { body += data; });
        response.on('end', function () { callback(body); });
    });
}

/*var links = fs.readFileSync('games.txt').toString().split(/\r?\n/), used_links = [];
for (var i = 0; i < links.length; i++) if (used_links.indexOf(links[i]) === -1) used_links.push(links[i]);
console.log(links.length, used_links.length);
fs.writeFileSync('links.json', JSON.stringify(used_links));
process.exit();*/

var links = JSON.parse(fs.readFileSync('links.json').toString()), games = JSON.parse(fs.readFileSync('games.json').toString());
var counter = games.length, gamesPerPage = 100;

function generateHTML () {
    console.log('Start writing all .html files...');

    // Index pages
    var max = Math.ceil(games.length / gamesPerPage);
    for (var i = 0; i < max; i++) {
        var pagination = '<a class="pagination-link left' + (i === 0 ? ' disabled' : '') + '" href="/' + (i - 1 !== 0 ? i : '') + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></a><div class="flex"></div>';
        for (var j = 0; j < max; j++) if (Math.abs((j + 1) - (i + 1)) < 5) pagination += '<a class="pagination-link' + (Math.abs(j - i) > 2 ? ' m' : '') + (i === j ? ' active' : '') + '" href="/' + (j !== 0 ? (j + 1) : '') + '">' + (j + 1) + '</a>';
        pagination += '<div class="flex"></div><a class="pagination-link right' + (i === max - 1 ? ' disabled' : '') + '" href="/' + (i + 2) + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></a>';

        var cards = '';
        for (var j = i * gamesPerPage; j < Math.min((i + 1) * gamesPerPage, games.length); j++) {
            cards += '<a class="card" href="/' + games[j].url + '">' +
                '<div class="badge ' + (games[j].flash ? 'flash' : 'html5') + '">' + (games[j].flash ? 'FLASH' : 'HTML5') + '</div>' +
                '<div class="card-image" style="background-image:url(' + games[j].image + ')"></div>' +
                '<h3>' + games[j].name + '</h3>' +
                '<p>' + (games[j].description.length > 85 ? (games[j].description.substring(0, 85) + '...') : games[j].description) + '</p>' +
            '</a>';
        }

        fs.writeFileSync('website/' + (i === 0 ? 'index' : (i + 1)) + '.html',
            '<!DOCTYPE html>' +
            '<html lang="en">' +
                '<head>' +
                    '<meta charset="UTF-8">' +
                    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                    '<meta name="description" content="BassieGames.ml heeft ' + games.length + ' gratis spelletjes en online games voor jong en oud. Speel nu gratis leuke spelletjes op ★ BassieGames.ml ★!">' +
                    '<meta name="keywords" content="Online spelletjes, gratis spelletjes, gratis online spelletjes, puzzel spelletjes, actie spelletjes, avontuur spelletjes, sport spelletjes, multiplayer spelletjes">' +
                    '<title>BassieGames</title>' +
                    '<link rel="canonical" href="http://bassiegames.ml/">' +
                    '<link rel="shortcut icon" href="/favicon.ico">' +
                    '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,700">' +
                    '<link rel="stylesheet" href="/style.css">' +
                '</head>' +
                '<body class="home">' +
                    '<div class="header">' +
                        '<div class="container">' +
                            '<h1 class="logo"><a href="/"><img src="favicon.png" alt="BassieGames icon"><span>BassieGames</span></a></h1>' +
                            '<form id="search-form" class="search-form" action="/zoeken">' +
                                '<input type="text" id="search-input" class="search-input" name="q" placeholder="Zoek voor een van de ' + games.length + ' spelletjes...">' +
                                '<button class="search-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></button>' +
                            '</form>' +
                        '</div>' +
                    '</div>' +
                    '<div class="main">' +
                        '<div class="container">' +
                            '<div class="pagination">' + pagination + '</div>' +
                            '<div class="cards">' + cards + '</div>' +
                            '<div class="pagination">' + pagination + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="footer">' +
                        '<div class="container">' +
                            '<p>Gemaakt door <a href="https://bastiaan.plaatsoft.nl/" target="_blank">Bastiaan van der Plaat</a> met spelletjes van <a href="http://www.spelletjes.nl/" target="_blank">Spelletjes.nl</a></p>' +
                        '</div>' +
                    '</div>' +
                    '<script src="/script.js"></script>' +
                '</body>' +
            '</html>'
        );
    }

    // Search page
    var cards = '';
    for (var i = 0; i < games.length; i++) {
        cards += '<a class="card" href="/' + games[i].url + '">' +
            '<div class="badge ' + (games[i].flash ? 'flash' : 'html5') + '">' + (games[i].flash ? 'FLASH' : 'HTML5') + '</div>' +
            '<div class="card-image" style="background-image:url(' + games[i].image + ')"></div>' +
            '<h3>' + games[i].name + '</h3>' +
            '<p>' + (games[i].description.length > 85 ? (games[i].description.substring(0, 85) + '...') : games[i].description) + '</p>' +
        '</a>';
    }
    
    fs.writeFileSync('website/zoeken.html',
        '<!DOCTYPE html>' +
        '<html lang="en">' +
            '<head>' +
                '<meta charset="UTF-8">' +
                '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                '<meta name="description" content="BassieGames.ml heeft ' + games.length + ' gratis spelletjes en online games voor jong en oud. Speel nu gratis leuke spelletjes op ★ BassieGames.ml ★!">' +
                '<meta name="keywords" content="Online spelletjes, gratis spelletjes, gratis online spelletjes, puzzel spelletjes, actie spelletjes, avontuur spelletjes, sport spelletjes, multiplayer spelletjes">' +
                '<title>Zoeken - BassieGames</title>' +
                '<link rel="canonical" href="http://bassiegames.ml/">' +
                '<link rel="shortcut icon" href="/favicon.ico">' +
                '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,700">' +
                '<link rel="stylesheet" href="/style.css">' +
            '</head>' +
            '<body class="home">' +
                '<div class="header">' +
                    '<div class="container">' +
                        '<h1 class="logo"><a href="/"><img src="favicon.png" alt="BassieGames icon"><span>BassieGames</span></a></h1>' +
                        '<form id="search-form" class="search-form" action="/zoeken">' +
                            '<input type="text" id="search-input" class="search-input" name="q" placeholder="Zoek voor een van de ' + games.length + ' spelletjes...">' +
                            '<button class="search-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></button>' +
                        '</form>' +
                        '<a class="button" href="/"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></a>' +
                    '</div>' +
                '</div>' +
                '<div class="main">' +
                    '<div class="container">' +
                        '<h2 id="subtitle" class="subtitle">Zoek voor een van de ' + games.length + ' spelletjes...</h2>' +
                        '<div id="games" class="cards">' + cards + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="footer">' +
                    '<div class="container">' +
                        '<p>Gemaakt door <a href="https://bastiaan.plaatsoft.nl/" target="_blank">Bastiaan van der Plaat</a> met spelletjes van <a href="http://www.spelletjes.nl/" target="_blank">Spelletjes.nl</a></p>' +
                    '</div>' +
                '</div>' +
                '<script src="/script.js"></script>' +
            '</body>' +
        '</html>'
    );

    // Game pages
    for (var i = 0; i < games.length; i++) {
        if (!fs.existsSync('website/' + games[i].url + '.html')) {
            fs.writeFileSync('website/' + games[i].url + '.html',
                '<!DOCTYPE html>' +
                '<html lang="en">' +
                    '<head>' +
                        '<meta charset="UTF-8">' +
                        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                        '<meta name="description" content="' + games[i].name + ', ' + games[i].description + '">' +
                        '<meta name="keywords" content="' + games[i].name + ', ' + games[i].name + ' online spelletjes, gratis ' + games[i].name + ' spelletjes, gratis spelletjes, gratis online ' + games[i].name + ' spelletjes, ' + games[i].name + ' spelletjes, gratis ' + games[i].name + '">' +
                        '<title>' + games[i].name + ' - BassieGames</title>' +
                        '<link rel="canonical" href="http://bassiegames.ml/' + games[i].url + '">' +
                        '<link rel="shortcut icon" href="/favicon.ico">' +
                        '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,700">' +
                        '<link rel="stylesheet" href="/style.css">' +
                    '</head>' +
                    '<body>' +
                        '<div class="background" style="background-image:url(' + games[i].image + ')"></div>' +
                        '<div class="header">' +
                            '<div class="container">' +
                                '<h1 class="logo"><a href="/"><img src="favicon.png" alt="BassieGames icon"><span>BassieGames</span></a></h1>' +
                                '<h2 class="name">' + games[i].name + '</h2>' +
                                '<button id="fullscreen" class="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg></button>' +
                                '<a class="button" href="/"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></a>' +
                            '</div>' +
                        '</div>' +
                        '<div id="wrapper" class="main">' +
                            '<' + (games[i].flash ? 'embed' : 'iframe') + ' id="game" class="hidden" src="' + games[i].src + '" data-width="' + games[i].width + '" data-height="' + games[i].height + '">' + (games[i].flash ? '' : '</iframe>') +
                        '</div>' +
                        '<script src="/script.js"></script>' +
                    '</body>' +
                '</html>'
            );
        }
    }
    console.log('Written all .html files');
    console.log('Deploy to http://bassiegames.ml/');
    child_process.execSync('surge website http://bassiegames.ml/');
    console.log('Deployed to http://bassiegames.ml/');
}

function loadGame () {
    console.log('Start ' + links[counter] + '...');
    request(links[counter], function (body) {
        var url = links[counter].substring('http://www.spelletjes.nl/spel/'.length);

        var image = body.substring(body.indexOf('<div id="backgroundScreen" style="background-image: url(') + '<div id="backgroundScreen" style="background-image: url('.length);
        image = image.slice(0, image.indexOf(')"></div>'));

        var name = body.substring(body.indexOf('                            title: "') + '                            title: "'.length);
        name = eval('\'' + name.slice(0, name.indexOf('",')) + '\'');

        var description = body.substring(body.indexOf('                            description: "') + '                            description: "'.length);
        description = eval('\'' + description.slice(0, description.indexOf('",')) + '\'');
        description = description === '' ? 'Speel nu dit leuke spelletje!' : description;

        var flash = body.substring(body.indexOf('isFlashGame: ') + 'isFlashGame: '.length);
        flash = (flash.slice(0, flash.indexOf(',')) === 'true');

        var src = body.substring(body.indexOf('settings: {\n                            src: \'') + 'settings: {\n                            src: \''.length);
        src = src.slice(0, src.indexOf('\','));

        var width = body.substring(body.indexOf('width: optimalGameSize.width || \'') + 'width: optimalGameSize.width || \''.length);
        width = parseInt(width.slice(0, width.indexOf('\',')));

        var height = body.substring(body.indexOf('height: optimalGameSize.height || \'') + 'height: optimalGameSize.height || \''.length);
        height = parseInt(height.slice(0, height.indexOf('\',')));

        games[counter] = { url: url, name: name, description: description, image: image, flash: flash, src: src, width: width, height: height };

        console.log('Loaded ' + links[counter] + ' | ' + counter + ' / ' + links.length + ' = ' + (counter / links.length * 100).toFixed(2) + ' %');
        if (counter !== links.length) {
            counter++;
            loadGame();
            fs.writeFileSync('games.json', JSON.stringify(games));
        } else {
            generateHTML();
        }
    });
}

if (process.argv[2] !== 'html' && counter !== links.length) {
    loadGame();
} else {
    generateHTML();
}
