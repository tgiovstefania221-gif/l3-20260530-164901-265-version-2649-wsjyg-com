(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  const backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let heroIndex = 0;
  let heroTimer = null;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer || slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showHeroSlide(index);
      window.clearInterval(heroTimer);
      heroTimer = null;
      startHeroTimer();
    });
  });

  showHeroSlide(0);
  startHeroTimer();

  const filterAreas = Array.from(document.querySelectorAll("[data-filter-area]"));

  filterAreas.forEach(function (area) {
    const input = area.querySelector("[data-search-input]");
    const year = area.querySelector("[data-year-filter]");
    const type = area.querySelector("[data-type-filter]");
    const cards = Array.from(area.querySelectorAll(".movie-card"));

    function applyFilter() {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const yearValue = year ? year.value : "";
      const typeValue = type ? type.value : "";

      cards.forEach(function (card) {
        const searchable = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.genre,
          card.dataset.year
        ].join(" ").toLowerCase();
        const matchesKeyword = !keyword || searchable.indexOf(keyword) !== -1;
        const matchesYear = !yearValue || card.dataset.year === yearValue;
        const matchesType = !typeValue || card.dataset.type.indexOf(typeValue) !== -1;

        card.classList.toggle("hidden-card", !(matchesKeyword && matchesYear && matchesType));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (year) {
      year.addEventListener("change", applyFilter);
    }

    if (type) {
      type.addEventListener("change", applyFilter);
    }
  });

  window.initMoviePlayer = function (videoId, buttonId, source) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    let hlsInstance = null;
    let prepared = false;

    if (!video || !button || !source) {
      return;
    }

    function prepareSource() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      prepareSource();
      button.classList.add("is-hidden");
      video.controls = true;
      const result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        startPlayback();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
