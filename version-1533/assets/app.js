(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var links = document.querySelector(".nav-links");
    if (!button || !links) {
      return;
    }
    button.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dots button", hero);
    var active = 0;

    function show(index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((active + 1) % slides.length);
      }, 5000);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = selectAll("[data-card]");
    var empty = document.querySelector("[data-empty]");
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      input.value = query;
    }

    function filter() {
      var term = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.textContent
        ].join(" "));
        var match = !term || haystack.indexOf(term) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", filter);
    filter();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
