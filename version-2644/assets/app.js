
(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('img[data-cover-img]').forEach((img) => {
    const poster = img.closest('.poster');
    if (img.complete && img.naturalWidth > 0) {
      poster && poster.classList.add('poster--loaded');
    } else {
      img.addEventListener('load', () => poster && poster.classList.add('poster--loaded'));
      img.addEventListener('error', () => {
        poster && poster.classList.add('poster--missing');
      });
    }
  });

  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  if (slides.length > 1) {
    let active = 0;
    const activate = (i) => {
      slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === i));
    };
    const next = () => {
      active = (active + 1) % slides.length;
      activate(active);
    };
    const prev = () => {
      active = (active - 1 + slides.length) % slides.length;
      activate(active);
    };
    const nextBtn = document.querySelector('[data-hero-next]');
    const prevBtn = document.querySelector('[data-hero-prev]');
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    setInterval(next, 5200);
  }

  document.querySelectorAll('[data-filter-form]').forEach((form) => {
    const input = form.querySelector('input[type="search"], input[data-filter-input]');
    const targetSelector = form.getAttribute('data-filter-target');
    if (!input || !targetSelector) return;
    const cards = Array.from(document.querySelectorAll(targetSelector));
    const countEl = form.querySelector('[data-filter-count]');
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const hay = [
          card.dataset.title || '',
          card.dataset.genres || '',
          card.dataset.tags || '',
          card.dataset.region || '',
          card.dataset.year || '',
        ].join(' ').toLowerCase();
        const ok = !q || hay.includes(q);
        card.classList.toggle('hidden', !ok);
        if (ok) shown += 1;
      });
      if (countEl) countEl.textContent = String(shown);
    };
    input.addEventListener('input', apply);
    apply();
  });
})();
