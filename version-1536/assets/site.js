(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    var stage = document.querySelector('.hero-stage');
    if (stage) {
      stage.addEventListener('mouseenter', stop);
      stage.addEventListener('mouseleave', start);
    }
    show(0);
    start();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function initFiltering() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var empty = document.querySelector('[data-empty]');
    if (!cards.length) {
      return;
    }
    if (input && getQueryValue('q')) {
      input.value = getQueryValue('q');
    }
    var state = {
      region: 'all',
      type: 'all',
      year: 'all'
    };
    function matches(card, keyword) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var region = card.getAttribute('data-region') || '';
      var type = card.getAttribute('data-type') || '';
      var year = card.getAttribute('data-year') || '';
      var regionOk = state.region === 'all' || state.region === region;
      var typeOk = state.type === 'all' || state.type === type;
      var yearOk = state.year === 'all' || state.year === year;
      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
      return regionOk && typeOk && yearOk && keywordOk;
    }
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card, keyword);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    if (input) {
      input.addEventListener('input', apply);
      input.addEventListener('search', apply);
    }
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        var group = button.getAttribute('data-filter-group');
        var value = button.getAttribute('data-filter');
        if (!group) {
          return;
        }
        state[group] = value;
        filters.filter(function (item) {
          return item.getAttribute('data-filter-group') === group;
        }).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  function initPlayer() {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-video') || '';
    var hls = null;
    var loaded = false;
    function bind() {
      if (!url || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    function play() {
      bind();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initNav();
    initHero();
    initFiltering();
    initPlayer();
  });
}());
