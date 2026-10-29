/* Line-drawing motion: hairlines draw on reveal, nav shows scroll progress. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const selector = [
    '.fact-row', '.role-list', '.role-item', '.spec', '.heritage-timeline li', '.heritage-detail',
    '.heritage-craft', '.heritage-bridge', '.heritage-art figcaption', '.heritage-sources',
    '.racing-context', '.latest-updates', '.race-deadlines', '.about', 'footer', '.contact-item',
    '.update-entry', '.rule'
  ].join(',');
  const targets = Array.from(document.querySelectorAll(selector));
  targets.forEach(el => {
    if (!el.classList.contains('rule')) el.dataset.line = '';
    const siblings = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
    el.style.setProperty('--ld', `${Math.min(siblings, 6) * 90}ms`);
  });
  if (reduce.matches || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-drawn'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-drawn');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .05 });
    targets.forEach(el => io.observe(el));
  }

  const nav = document.querySelector('nav');
  if (!nav) return;
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
  };
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* ---- Interactive layer: cursor ring, magnetic buttons, tilt, parallax, runners, ticker, counters ---- */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const lang = () => (document.documentElement.lang === 'zh-Hant' ? 'zh' : 'en');

  /* Ticker */
  const ticker = document.getElementById('ticker');
  const words = {
    en: ['Culture', 'Craft', 'Collective spirit', 'Aerodynamics', 'Tai Hang', 'STEM Racing', 'Hong Kong', 'Carry the fire'],
    zh: ['文化', '匠心', '同心', '空氣動力學', '大坑', 'STEM Racing', '香港', '薪火疾行']
  };
  function buildTicker() {
    if (!ticker) return;
    const row = words[lang()].map(w => `<span>${w}</span><i></i>`).join('');
    ticker.innerHTML = `<div class="ticker-track">${row}${row}</div>`;
  }
  buildTicker();
  new MutationObserver(buildTicker).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* Counters */
  const stats = document.getElementById('stats');
  function runCounters() {
    stats.querySelectorAll('b').forEach(el => {
      let target = Number(el.dataset.count);
      if (el.dataset.days) {
        const t = new Date(); t.setHours(0, 0, 0, 0);
        const [y, m, d] = el.dataset.days.split('-').map(Number);
        target = Math.max(0, Math.round((new Date(y, m - 1, d) - t) / 86400000));
      }
      if (reduce.matches) { el.textContent = target; return; }
      const start = performance.now(), dur = 1600;
      const tick = now => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
  if (stats) {
    if ('IntersectionObserver' in window) {
      const so = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting)) { stats.classList.add('is-drawn'); runCounters(); so.disconnect(); }
      }, { threshold: .3 });
      so.observe(stats);
    } else { stats.classList.add('is-drawn'); runCounters(); }
  }

  /* Pager progress dots follow the active page */
  const pages = document.getElementById('heroPages');
  if (pages) {
    const dots = Array.from(document.querySelectorAll('#pagerProgress i'));
    const syncDots = () => dots.forEach((d, i) => d.classList.toggle('on', i + 1 === Number(pages.dataset.page || 1)));
    new MutationObserver(syncDots).observe(pages, { attributes: true, attributeFilter: ['data-page'] });
    syncDots();
  }

  if (reduce.matches) return;

  /* Runners: light points travelling along the orbit curve */
  const path = document.getElementById('runnerPath');
  const runners = Array.from(document.querySelectorAll('.runner'));
  if (path && runners.length) {
    const len = path.getTotalLength();
    const t0 = performance.now();
    const step = now => {
      if (!document.hidden) {
        runners.forEach((r, i) => {
          const p = (((now - t0) / 7000) - i * .018) % 1;
          const pt = path.getPointAtLength((p < 0 ? p + 1 : p) * len);
          r.setAttribute('cx', pt.x); r.setAttribute('cy', pt.y);
        });
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  if (!fine.matches) return;

  /* Cursor ring */
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(ring);
  let mx = -100, my = -100, rx = -100, ry = -100;
  window.addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    ring.classList.toggle('is-link', !!e.target.closest('a, button, summary, [data-page-target]'));
  }, { passive: true });
  document.addEventListener('pointerdown', () => ring.classList.add('is-down'), { passive: true });
  document.addEventListener('pointerup', () => ring.classList.remove('is-down'), { passive: true });
  const follow = () => {
    rx += (mx - rx) * .18; ry += (my - ry) * .18;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(follow);
  };
  follow();

  /* Magnetic buttons */
  document.querySelectorAll('.heritage-button, .proposal-link, .updates-preview-link, .proposal-contact').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* Card tilt with a moving highlight */
  const tiltSel = '.member-card, .partner-item, .deadline-card, .update-preview-card';
  document.addEventListener('pointermove', e => {
    const card = e.target.closest?.(tiltSel);
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--rx', `${((.5 - y) * 6).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${((x - .5) * 8).toFixed(2)}deg`);
    card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    card.classList.add('is-tilting');
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    const card = e.target.closest?.(tiltSel);
    if (card && !card.contains(e.relatedTarget)) {
      card.classList.remove('is-tilting');
      card.style.removeProperty('--rx'); card.style.removeProperty('--ry');
    }
  }, { passive: true });

  /* Hero parallax */
  const stage = document.getElementById('dragonStage');
  const hero = document.querySelector('.hero');
  if (stage && hero) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      stage.style.setProperty('--px', `${(x * -26).toFixed(1)}px`);
      stage.style.setProperty('--py', `${(y * -18).toFixed(1)}px`);
    }, { passive: true });
  }
})();
/* Page-cover parallax and the hero logo that shrinks into the nav mark */
(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const covers = Array.from(document.querySelectorAll('.page-cover img'));
  const pages = document.getElementById('heroPages');
  const dragon = document.getElementById('dragon');
  const navMark = document.getElementById('navMark');
  if (!covers.length && !navMark) return;

  let fly = null;
  let start = null;
  const RANGE = 320;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);

  const measure = () => {
    if (!dragon) return;
    const r = dragon.getBoundingClientRect();
    if (!r.width) return;
    const side = Math.min(r.width, r.height);
    start = { x: r.left + scrollX + (r.width - side) / 2, y: r.top + scrollY + (r.height - side) / 2, s: side };
  };

  if (!still && dragon && navMark) {
    fly = document.createElement('img');
    fly.className = 'fly-mark';
    fly.src = dragon.currentSrc || dragon.src;
    fly.alt = '';
    fly.width = 100; fly.height = 100;
    document.body.appendChild(fly);
    if (dragon.complete) measure(); else dragon.addEventListener('load', measure, { once: true });
    window.addEventListener('resize', () => { if (scrollY < 4) measure(); });
  }

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY;
    if (!still) covers.forEach(c => c.style.setProperty('--cy', `${(y * 0.22).toFixed(1)}px`));
    if (!navMark) return;
    const onIntro = !pages || pages.dataset.page === undefined || pages.dataset.page === '1';
    if (!fly || !start) { navMark.style.opacity = 1; return; }
    if (!onIntro) { fly.style.opacity = 0; dragon.classList.remove('is-flown'); navMark.style.opacity = 1; return; }
    const t = Math.min(1, y / RANGE);
    const e = ease(t);
    const target = navMark.getBoundingClientRect();
    const size = lerp(start.s, target.width || 34, e);
    const x = lerp(start.x - scrollX, target.left, e);
    const yy = lerp(start.y - y, target.top, e);
    fly.style.width = fly.style.height = `${size}px`;
    fly.style.transform = `translate3d(${x.toFixed(1)}px, ${yy.toFixed(1)}px, 0)`;
    const active = t > 0.002 && t < 1;
    fly.style.opacity = active ? 1 : 0;
    dragon.classList.toggle('is-flown', active || t >= 1);
    navMark.style.opacity = t >= 1 ? 1 : 0;
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  if (pages) new MutationObserver(queue).observe(pages, { attributes: true, attributeFilter: ['data-page'] });
  update();
})();
