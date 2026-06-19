(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupHeader() {
    var header = one("[data-header]");
    var toggle = one("[data-menu-toggle]");
    var mobileNav = one("[data-mobile-nav]");

    function setHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 42);
    }

    setHeader();
    window.addEventListener("scroll", setHeader, { passive: true });

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
      });
    }
  }

  function setupHero() {
    var root = one("[data-hero]");
    if (!root) {
      return;
    }

    var slides = all("[data-hero-slide]", root);
    var dots = all("[data-hero-dot]", root);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var forms = all("[data-filter-form]");
    forms.forEach(function (form) {
      var list = form.parentElement.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }

      var cards = all("[data-card]", list);
      var search = one("[data-search-input]", form);
      var type = one("[data-type-filter]", form);
      var year = one("[data-year-filter]", form);
      var category = one("[data-category-filter]", form);
      var empty = form.parentElement.querySelector("[data-empty-state]");

      function apply() {
        var q = normalize(search && search.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        var selectedCategory = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;

          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (selectedType && normalize(card.getAttribute("data-type")) !== selectedType) {
            ok = false;
          }
          if (selectedYear && normalize(card.getAttribute("data-year")) !== selectedYear) {
            ok = false;
          }
          if (selectedCategory && haystack.indexOf(selectedCategory) === -1) {
            ok = false;
          }

          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, type, year, category].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });
    });
  }

  function setupBackTop() {
    all("[data-back-top]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  window.setupPlayer = function (source) {
    var video = one(".movie-video");
    var overlay = one(".play-trigger");
    var hls = null;
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function begin() {
      attachSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupBackTop();
  });
})();
