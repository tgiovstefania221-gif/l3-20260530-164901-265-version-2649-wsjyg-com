(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-missing');
            }, { once: true });
        });

        document.querySelectorAll('[data-search-input]').forEach(function (input) {
            var scope = input.closest('section') || document;
            var list = scope.querySelector('[data-search-list]') || document;
            var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .ranking-row'));

            input.addEventListener('input', function () {
                var q = input.value.trim().toLowerCase();

                items.forEach(function (item) {
                    var text = [
                        item.getAttribute('data-title'),
                        item.getAttribute('data-year'),
                        item.getAttribute('data-region'),
                        item.getAttribute('data-genre'),
                        item.getAttribute('data-tags'),
                        item.textContent
                    ].join(' ').toLowerCase();

                    item.classList.toggle('is-filtered-out', q && text.indexOf(q) === -1);
                });
            });
        });

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(i) {
                index = (i + slides.length) % slides.length;
                slides.forEach(function (slide, n) {
                    slide.classList.toggle('is-active', n === index);
                });
                dots.forEach(function (dot, n) {
                    dot.classList.toggle('is-active', n === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    restart();
                });
            });

            restart();
        }

        document.querySelectorAll('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.player-start');
            var stream = video ? video.getAttribute('data-stream') : '';
            var hlsInstance = null;
            var hasStarted = false;

            function start() {
                if (!video || !stream) {
                    return;
                }

                if (button) {
                    button.classList.add('is-hidden');
                }

                if (!hasStarted) {
                    hasStarted = true;

                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                }

                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            }

            if (button) {
                button.addEventListener('click', start);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (!hasStarted || video.paused) {
                        start();
                    }
                });
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
                video.addEventListener('emptied', function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                });
            }
        });
    });
})();
