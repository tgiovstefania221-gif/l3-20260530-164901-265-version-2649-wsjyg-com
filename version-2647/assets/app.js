// 亚洲精选视频 - 纯静态交互脚本
// 包含移动端导航、Hero 轮播、搜索筛选、HLS 播放器初始化和返回顶部。

(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('.js-hero-carousel');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var pages = Array.prototype.slice.call(document.querySelectorAll('.library-section, .sitemap-page'));

    pages.forEach(function (section) {
      var searchInput = section.querySelector('.js-search-input');
      var selects = Array.prototype.slice.call(section.querySelectorAll('.filter-select'));
      var cards = Array.prototype.slice.call(section.querySelectorAll('.js-movie-card'));
      var count = section.querySelector('[data-result-count]');
      var noResults = section.querySelector('[data-no-results]');

      if (!cards.length) {
        return;
      }

      function apply() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute('data-search'));
          var match = !keyword || searchText.indexOf(keyword) !== -1;

          selects.forEach(function (select) {
            var field = select.getAttribute('data-filter-field');
            var value = normalize(select.value);
            var cardValue = normalize(card.getAttribute('data-' + field));

            if (value && cardValue.indexOf(value) === -1) {
              match = false;
            }
          });

          card.hidden = !match;

          if (match) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }

        if (noResults) {
          noResults.hidden = visible !== 0;
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });

      apply();
    });
  }

  function initPlayer() {
    var video = document.getElementById('video-player');
    var startButton = document.querySelector('[data-player-start]');

    if (!video || !startButton) {
      return;
    }

    var source = video.getAttribute('data-src');
    var initialized = false;
    var hlsInstance = null;

    function attachSource() {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    startButton.addEventListener('click', function () {
      attachSource();
      startButton.classList.add('is-hidden');

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          startButton.classList.remove('is-hidden');
        });
      }
    });

    video.addEventListener('play', function () {
      startButton.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initBackToTop() {
    var button = document.querySelector('[data-back-to-top]');

    if (!button) {
      return;
    }

    function refresh() {
      button.classList.toggle('is-visible', window.scrollY > 620);
    }

    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', refresh, { passive: true });
    refresh();
  }

  ready(function () {
    initMenu();
    initHeroCarousel();
    initFilters();
    initPlayer();
    initBackToTop();
  });
}());
