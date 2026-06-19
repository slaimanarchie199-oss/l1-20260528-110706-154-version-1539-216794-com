(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    start();
  }

  function initLocalFilter() {
    var panel = document.querySelector(".filter-panel");
    if (!panel) {
      return;
    }
    var input = panel.querySelector(".local-filter-input");
    var year = panel.querySelector(".local-filter-year");
    var region = panel.querySelector(".local-filter-region");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var r = region ? region.value : "";
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.type, card.dataset.genre, card.dataset.region, card.dataset.category].join(" ").toLowerCase();
        var ok = (!q || text.indexOf(q) !== -1) && (!y || card.dataset.year === y) && (!r || card.dataset.region === r);
        card.style.display = ok ? "" : "none";
      });
    }
    [input, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
  }

  function createCard(item) {
    return [
      '<article class="movie-card compact">',
      '<a href="' + item.url + '" aria-label="观看' + item.title + '">',
      '<div class="poster-frame">',
      '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
      '<span class="poster-badge">' + item.year + '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + item.region + '</span><span>' + item.type + '</span></div>',
      '<h2>' + item.title + '</h2>',
      '<p>' + item.line + '</p>',
      '<div class="tag-row"><span>' + item.category + '</span><span>' + item.genre + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function initSearch() {
    var form = document.getElementById("searchForm");
    var input = document.getElementById("searchInput");
    var type = document.getElementById("searchType");
    var results = document.getElementById("searchResults");
    if (!form || !input || !results || !window.SEARCH_DATA) {
      return;
    }
    function render() {
      var q = input.value.trim().toLowerCase();
      var t = type ? type.value : "";
      var list = window.SEARCH_DATA.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.line, item.category].join(" ").toLowerCase();
        return (!q || text.indexOf(q) !== -1) && (!t || item.type.indexOf(t) !== -1 || item.genre.indexOf(t) !== -1);
      }).slice(0, 96);
      results.innerHTML = list.map(createCard).join("");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener("input", render);
    if (type) {
      type.addEventListener("change", render);
    }
    render();
  }

  ready(function () {
    initNav();
    initHero();
    initLocalFilter();
    initSearch();
  });
})();
