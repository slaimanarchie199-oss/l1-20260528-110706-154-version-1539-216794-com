
(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    const btn = qs('[data-menu-btn]');
    const nav = qs('[data-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
  }

  function initHero() {
    const slider = qs('[data-hero-slider]');
    if (!slider) return;

    const slides = qsa('.hero-slide', slider);
    const dotsWrap = qs('[data-hero-dots]');
    const prev = qs('[data-hero-prev]');
    const next = qs('[data-hero-next]');
    if (!slides.length) return;

    let index = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
    if (index < 0) index = 0;
    let timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      if (dotsWrap) {
        qsa('.hero-dot', dotsWrap).forEach((dot, i) => dot.classList.toggle('active', i === index));
      }
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(() => activate(index + 1), 6000);
    }

    if (dotsWrap && !dotsWrap.dataset.built) {
      dotsWrap.dataset.built = 'true';
      dotsWrap.innerHTML = slides.map((_, i) => `<button class="hero-dot${i === index ? ' active' : ''}" aria-label="切换到第 ${i + 1} 张"></button>`).join('');
      qsa('.hero-dot', dotsWrap).forEach((dot, i) => dot.addEventListener('click', () => {
        activate(i);
        schedule();
      }));
    }

    if (prev) prev.addEventListener('click', () => { activate(index - 1); schedule(); });
    if (next) next.addEventListener('click', () => { activate(index + 1); schedule(); });

    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', schedule);
    schedule();
  }

  function initLocalFilter() {
    const input = qs('[data-filter-input]');
    const target = qs('[data-filter-target]');
    if (!input || !target) return;
    const cards = qsa('[data-filter-item]', target);
    const empty = qs('[data-filter-empty]');
    function apply() {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach(card => {
        const text = (card.getAttribute('data-filter-item') || card.textContent || '').toLowerCase();
        const ok = !q || text.includes(q);
        card.classList.toggle('hidden', !ok);
        if (ok) shown += 1;
      });
      if (empty) empty.classList.toggle('hidden', shown !== 0);
    }
    input.addEventListener('input', apply);
    apply();
  }

  function params() {
    const p = {};
    const usp = new URLSearchParams(window.location.search);
    usp.forEach((v, k) => { p[k] = v; });
    return p;
  }

  async function initSearchPage() {
    const el = qs('[data-search-results]');
    if (!el) return;
    const q = (params().q || '').trim().toLowerCase();
    const info = qs('[data-search-query]');
    if (info) info.textContent = q || '全部影片';

    const useData = async () => {
      let data = window.FILMS_INDEX;
      if (!Array.isArray(data)) {
        try {
          const res = await fetch('films-index.json', { cache: 'no-store' });
          data = await res.json();
        } catch (e) {
          data = [];
        }
      }
      const results = !q ? data : data.filter(item => {
        const hay = [
          item.title, item.region, item.type, item.year, item.genre, item.one_line, item.summary, item.review
        ].join(' ').toLowerCase();
        return hay.includes(q);
      }).sort((a, b) => Number(b.year) - Number(a.year));

      el.innerHTML = results.slice(0, 500).map(item => `
        <a class="search-result" href="${item.url}">
          <img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)}">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <div class="meta-line">
              <span class="pill">${escapeHtml(item.year)}</span>
              <span class="pill">${escapeHtml(item.region)}</span>
              <span class="pill">${escapeHtml(item.type)}</span>
            </div>
            <p class="desc">${escapeHtml(trunc(item.one_line || item.summary || '', 180))}</p>
          </div>
        </a>
      `).join('');
      const count = qs('[data-search-count]');
      if (count) count.textContent = String(results.length);
      if (!results.length) {
        el.innerHTML = '<div class="section-box"><p class="muted">没有找到匹配结果。</p></div>';
      }
    };

    useData();
  }

  function initBackToTop() {
    const btn = qs('[data-back-top]');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[s]));
  }

  function trunc(str, max) {
    str = String(str || '');
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initBackToTop();
  });
})();
