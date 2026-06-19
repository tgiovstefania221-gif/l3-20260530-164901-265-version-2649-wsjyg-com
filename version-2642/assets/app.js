
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function setText(el, txt) { if (el) el.textContent = txt; }

  function initMenu() {
    const btn = qs('[data-menu-btn]');
    const panel = qs('[data-mobile-panel]');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => panel.classList.toggle('open'));
  }

  function initActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    qsa('[data-nav-link]').forEach(a => {
      if (a.getAttribute('href') === path) a.classList.add('active');
    });
  }

  function initHeroSlider() {
    const hero = qs('[data-hero]');
    if (!hero) return;
    const slides = qsa('.hero-slide', hero);
    const dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) return;
    let idx = 0;
    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('active', n === idx));
      dots.forEach((d, n) => d.classList.toggle('active', n === idx));
    }
    qsa('[data-hero-next]', hero).forEach(btn => btn.addEventListener('click', () => show(idx + 1)));
    qsa('[data-hero-prev]', hero).forEach(btn => btn.addEventListener('click', () => show(idx - 1)));
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    show(0);
    setInterval(() => show(idx + 1), 5200);
  }

  function filterCardsByInput(input, scopeSel) {
    const scope = qs(scopeSel);
    if (!input || !scope) return;
    const cards = qsa('[data-card]', scope);
    function apply() {
      const term = input.value.trim().toLowerCase();
      cards.forEach(card => {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('hidden', term && !text.includes(term));
      });
      const visible = cards.filter(card => !card.classList.contains('hidden')).length;
      const counter = qs('[data-search-count]', scope);
      if (counter) counter.textContent = visible + ' 条结果';
    }
    input.addEventListener('input', apply);
    apply();
  }

  function initFiltering() {
    qsa('[data-search-input]').forEach(input => {
      const scope = input.getAttribute('data-search-input');
      filterCardsByInput(input, scope);
    });
  }

  function initSearchPage() {
    const mount = qs('[data-search-page]');
    if (!mount || !window.SITE_MOVIES) return;
    const input = qs('[data-search-q]', mount);
    const list = qs('[data-search-results]', mount);
    const count = qs('[data-search-count]', mount);
    function render(items) {
      list.innerHTML = items.map(movie => `
        <a class="card" data-card data-search="${movie.title} ${movie.genre} ${movie.tags.join(' ')} ${movie.summary}" href="${movie.url}">
          <div class="poster">
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="overlay"></div>
            <div class="corner">${movie.year} · ${movie.type}</div>
          </div>
          <div class="card-body">
            <h3>${movie.title}</h3>
            <div class="meta-line"><span>${movie.region}</span><span>${movie.genre}</span></div>
            <p class="excerpt">${movie.one_line}</p>
            <div class="chips">
              ${movie.tags.slice(0,3).map(t => `<span>${t}</span>`).join('')}
            </div>
          </div>
        </a>
      `).join('');
      setText(count, items.length + ' 条结果');
    }
    function doSearch() {
      const q = (input.value || '').trim().toLowerCase();
      let items = window.SITE_MOVIES.slice();
      if (q) {
        items = items.filter(m => {
          const hay = [m.title, m.region, m.type, m.genre, m.tags.join(' '), m.one_line, m.summary].join(' ').toLowerCase();
          return hay.includes(q);
        });
      }
      items.sort((a, b) => b.score - a.score);
      render(items.slice(0, 120));
    }
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';
    input.addEventListener('input', doSearch);
    doSearch();
  }

  function initPlayer() {
    const player = qs('[data-player]');
    if (!player) return;
    const video = qs('video', player);
    const poster = qs('[data-player-poster]', player);
    const btn = qs('[data-player-btn]', player);
    if (!video) return;
    const hlsUrl = video.getAttribute('data-hls');
    const mp4Url = video.getAttribute('data-mp4');
    let started = false;
    function startPlayback() {
      if (started) return;
      started = true;
      if (poster) poster.classList.add('hidden');
      if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.play().catch(() => {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        try {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(() => {});
          });
          return;
        } catch (e) {}
      }
      video.src = mp4Url;
      video.play().catch(() => {});
    }
    if (btn) btn.addEventListener('click', startPlayback);
    video.addEventListener('click', startPlayback);
    player.addEventListener('click', function (ev) {
      if (ev.target === video) return;
      if (!started) startPlayback();
    });
  }

  function initBackToTop() {
    const btn = qs('[data-top-btn]');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.style.opacity = window.scrollY > 500 ? '1' : '0';
      btn.style.pointerEvents = window.scrollY > 500 ? 'auto' : 'none';
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initActiveNav();
    initHeroSlider();
    initFiltering();
    initSearchPage();
    initPlayer();
    initBackToTop();
  });
})();
