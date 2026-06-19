(function () {
  var body = document.body;

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $$('.hero-slide', hero);
    var dots = $$('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function play() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function initSearch() {
    var panel = $('[data-search-panel]');
    var form = $('[data-search-form]');
    var input = form ? form.querySelector('input[name="keyword"]') : null;
    var results = $('[data-search-results]');
    if (!panel || !form || !input || !results) {
      return;
    }

    function openPanel() {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      body.style.overflow = 'hidden';
      setTimeout(function () {
        input.focus();
      }, 60);
    }

    function closePanel() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      body.style.overflow = '';
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<p class="empty-result">没有找到匹配内容</p>';
        return;
      }
      results.innerHTML = items.slice(0, 24).map(function (item) {
        return [
          '<a class="search-result-card" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span>',
          '<h3>' + escapeHtml(item.title) + '</h3>',
          '<p>' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year) + '</p>',
          '<p>' + escapeHtml(item.line || item.genre || '') + '</p>',
          '</span>',
          '</a>'
        ].join('');
      }).join('');
    }

    function search(keyword) {
      var word = keyword.trim().toLowerCase();
      var list = window.SITE_MOVIES || [];
      if (!word) {
        render(list.slice(0, 12));
        return;
      }
      render(list.filter(function (item) {
        var pool = [item.title, item.region, item.type, item.year, item.genre, item.line, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return pool.indexOf(word) !== -1;
      }));
    }

    $$('[data-search-open]').forEach(function (button) {
      button.addEventListener('click', function () {
        openPanel();
        search(input.value || '');
      });
    });

    $$('[data-search-close]').forEach(function (button) {
      button.addEventListener('click', closePanel);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      search(input.value || '');
    });

    input.addEventListener('input', function () {
      search(input.value || '');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closePanel();
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initFilters() {
    var bar = $('[data-filter-bar]');
    var list = $('[data-filter-list]');
    if (!bar || !list) {
      return;
    }
    var cards = $$('[data-movie-card]', list);
    bar.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter-region]');
      if (!button) {
        return;
      }
      var region = button.getAttribute('data-filter-region');
      $$('button[data-filter-region]', bar).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      cards.forEach(function (card) {
        var ok = region === 'all' || card.getAttribute('data-region') === region;
        card.style.display = ok ? '' : 'none';
      });
    });
  }

  function initPlayer() {
    var video = $('[data-player-video]');
    if (!video) {
      return;
    }
    var button = $('[data-player-button]');
    var stream = video.getAttribute('data-stream');
    var hls = null;
    var ready = false;

    function prepare() {
      if (ready || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      ready = true;
    }

    function start() {
      prepare();
      if (button) {
        button.classList.add('hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
    initFilters();
    initPlayer();
  });
})();
