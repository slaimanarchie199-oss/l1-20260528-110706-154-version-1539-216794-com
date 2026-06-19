(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function textOf(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scopeName = panel.getAttribute('data-filter-panel');
      var scope = document.querySelector('[data-filter-scope="' + scopeName + '"]');
      if (!scope) return;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var q = panel.querySelector('[data-filter-query]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var empty = document.querySelector('[data-empty-for="' + scopeName + '"]');
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (q && initial) q.value = initial;

      function apply() {
        var query = textOf(q && q.value);
        var selectedRegion = textOf(region && region.value);
        var selectedType = textOf(type && type.value);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = textOf(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type'));
          var cardRegion = textOf(card.getAttribute('data-region'));
          var cardType = textOf(card.getAttribute('data-type'));
          var match = true;
          if (query && haystack.indexOf(query) === -1) match = false;
          if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) match = false;
          if (selectedType && cardType.indexOf(selectedType) === -1) match = false;
          card.style.display = match ? '' : 'none';
          if (match) shown += 1;
        });
        if (empty) empty.style.display = shown ? 'none' : 'block';
      }

      [q, region, type].forEach(function (el) {
        if (!el) return;
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      });
      apply();
    });
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var q = input ? input.value.trim() : '';
        var url = './search.html';
        if (q) url += '?q=' + encodeURIComponent(q);
        window.location.href = url;
      });
    });
  }

  function attachSource(video, src, done) {
    if (!video || !src) return;
    if (video.getAttribute('data-loaded') === src) {
      if (done) done();
      return;
    }
    video.setAttribute('data-loaded', src);
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      if (done) done();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (done) done();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) return;
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      video._hls = hls;
      return;
    }
    video.src = src;
    if (done) done();
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      var src = button ? button.getAttribute('data-src') : player.getAttribute('data-src');
      if (!video || !src) return;
      var started = false;

      function start() {
        attachSource(video, src, function () {
          started = true;
          video.controls = true;
          if (button) button.classList.add('is-hidden');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        });
      }

      if (button) {
        button.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (!started) {
          start();
          return;
        }
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchForms();
    initPlayers();
  });
})();
