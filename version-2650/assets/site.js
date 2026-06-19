
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  inputs.forEach(function (input) {
    var scope = input.closest('section') || document;
    var list = scope.querySelector('[data-search-list]');
    if (!list) {
      list = document.querySelector('[data-search-list]');
    }
    if (!list) {
      return;
    }
    var items = Array.prototype.slice.call(list.children);
    input.addEventListener('input', function () {
      var term = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-tags') || '',
          item.getAttribute('data-region') || '',
          item.getAttribute('data-type') || '',
          item.getAttribute('data-year') || '',
          item.textContent || ''
        ].join(' ').toLowerCase();
        item.classList.toggle('is-filter-hidden', term && text.indexOf(term) === -1);
      });
    });
  });
})();
