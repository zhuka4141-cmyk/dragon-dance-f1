/* Shared language registry for the site.
   Runs in <head>: resolves the visitor's language, sets <html lang>, and loads
   only the dictionary for the language actually in use. */
(() => {
  const STORAGE_KEY = 'dragon-dance-language';

  const META = {
    en: { name: 'English', short: 'EN', htmlLang: 'en', locale: 'en-GB' },
    'zh-Hant': { name: '繁體中文', short: '繁', htmlLang: 'zh-Hant', locale: 'zh-HK' },
    'zh-Hans': { name: '简体中文', short: '简', htmlLang: 'zh-Hans', locale: 'zh-CN' },
    ja: { name: '日本語', short: '日', htmlLang: 'ja', locale: 'ja-JP' },
    ko: { name: '한국어', short: '한', htmlLang: 'ko', locale: 'ko-KR' },
    es: { name: 'Español', short: 'ES', htmlLang: 'es', locale: 'es-ES' },
    fr: { name: 'Français', short: 'FR', htmlLang: 'fr', locale: 'fr-FR' },
    de: { name: 'Deutsch', short: 'DE', htmlLang: 'de', locale: 'de-DE' },
    pt: { name: 'Português', short: 'PT', htmlLang: 'pt', locale: 'pt-PT' }
  };
  const SUPPORTED = Object.keys(META);

  /* English is the source language: the copy already lives in the markup. */
  const EN_UI = {
    languageSelector: 'Language selector',
    chooseLanguage: 'Choose language',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    pageLabel: 'Page {n}',
    homepageLabel: 'Dragon Dance homepage',
    dragonStageLabel: 'Interactive Dragon Dance dragon symbol',
    dragonAlt: 'Dragon Dance dragon symbol',
    carPhotoLabel: '01 / DRAGON PROTOTYPE',
    contactLabel: 'Contact',
    closeDialog: 'Close dialog',
    artworkAlt: 'An artistic interpretation of an incense-lit dragon following a glowing pearl',
    copyEmail: 'Copy email address',
    emailCopied: 'Email address copied',
    emailCopyFailed: 'Could not copy the email address. Please select and copy it.',
    daysToGo: '{n} days to go',
    today: 'Today',
    complete: 'Complete',
    pinned: 'Pinned',
    readUpdate: 'Read update ↗',
    readUpdateLabel: 'Read update: ',
    pagerHome: 'Home',
    pagerHeritage: 'Fire Dragon',
    pagerCrew: 'Crew',
    pagerPartners: 'Partners',
    feedLoading: 'Loading latest updates...',
    feedEmpty: 'No updates published yet. Check back soon.',
    feedError: 'Updates are unavailable right now.',
    feedRetry: 'Try again',
    mediaUnavailable: 'Media unavailable',
    closeGallery: 'Close gallery',
    previousMedia: 'Previous media',
    nextMedia: 'Next media',
    viewMediaN: 'View media {n}',
    openMediaGallery: 'Open media gallery: ',
    viewMediaCount: 'View media · {n}',
  };

  const dictionaries = { en: { ui: EN_UI } };
  const loading = {};
  const subscribers = [];

  function normalise(value) {
    if (value === 'zh') return 'zh-Hant';
    return SUPPORTED.includes(value) ? value : '';
  }

  /* Browser tags collapse onto the supported set; anything else stays English. */
  function match(tag) {
    const value = String(tag || '').toLowerCase();
    if (!value) return '';
    if (value.startsWith('zh')) return /hans|cn|sg|my/.test(value) ? 'zh-Hans' : 'zh-Hant';
    if (value.startsWith('ja')) return 'ja';
    if (value.startsWith('ko')) return 'ko';
    if (value.startsWith('es')) return 'es';
    if (value.startsWith('fr')) return 'fr';
    if (value.startsWith('de')) return 'de';
    if (value.startsWith('pt')) return 'pt';
    if (value.startsWith('en')) return 'en';
    return '';
  }

  function detect() {
    const list = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    for (const tag of list) {
      const code = match(tag);
      if (code) return code;
    }
    return 'en';
  }

  function fromQuery() {
    try { return normalise(new URLSearchParams(window.location.search).get('lang')); } catch (_) { return ''; }
  }

  function fromStorage() {
    try { return normalise(window.localStorage.getItem(STORAGE_KEY)); } catch (_) { return ''; }
  }

  /* An explicit choice wins: ?lang= for shared links, then a stored pick, then the browser. */
  function resolve() {
    return fromQuery() || fromStorage() || detect();
  }

  const state = { current: resolve() };

  function register(code, dictionary) {
    if (!SUPPORTED.includes(code)) return;
    dictionaries[code] = dictionary;
  }

  function load(code) {
    if (code === 'en' || dictionaries[code]?.text) return Promise.resolve(dictionaries[code]);
    if (loading[code]) return loading[code];
    loading[code] = new Promise((resolveLoad, rejectLoad) => {
      const script = document.createElement('script');
      script.src = `assets/i18n/${code}.js`;
      script.async = true;
      script.onload = () => resolveLoad(dictionaries[code]);
      script.onerror = () => rejectLoad(new Error(`Language file missing: ${code}`));
      document.head.append(script);
    });
    return loading[code];
  }

  function dict(code) {
    return dictionaries[code] || dictionaries.en;
  }

  function ui(key, vars) {
    const table = dict(state.current).ui || {};
    let value = table[key] ?? EN_UI[key] ?? key;
    if (vars) for (const [name, replacement] of Object.entries(vars)) value = value.replace(`{${name}}`, replacement);
    return value;
  }

  function paint() {
    document.documentElement.lang = META[state.current].htmlLang;
    document.documentElement.dataset.lang = state.current;
  }

  paint();

  /* The markup ships English, so any other language hides the body until the
     dictionary is applied. The timer is the failure path, not the happy path. */
  if (state.current !== 'en') {
    const style = document.createElement('style');
    style.textContent = 'html[data-lang]:not([data-lang-ready]) body{opacity:0}';
    document.head.append(style);
    window.setTimeout(() => document.documentElement.setAttribute('data-lang-ready', ''), 3000);
  }

  const ready = load(state.current).catch(() => null);

  function set(code) {
    const next = normalise(code) || 'en';
    state.current = next;
    paint();
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
    return load(next)
      .catch(() => null)
      .then(() => { subscribers.forEach(fn => fn(next)); return next; });
  }

  function subscribe(fn) {
    subscribers.push(fn);
    return () => {
      const index = subscribers.indexOf(fn);
      if (index >= 0) subscribers.splice(index, 1);
    };
  }

  /* Language menu: built here so the language list has a single source of truth. */
  function bindSwitcher() {
    const toggle = document.getElementById('languageToggle');
    const menu = document.getElementById('languageMenu');
    if (!toggle || !menu) return;

    const label = toggle.querySelector('.language-current');
    menu.textContent = '';

    const options = SUPPORTED.map(code => {
      const item = document.createElement('li');
      item.className = 'language-option';
      item.setAttribute('role', 'option');
      item.setAttribute('tabindex', '-1');
      item.setAttribute('lang', META[code].htmlLang);
      item.dataset.lang = code;
      item.textContent = META[code].name;
      menu.append(item);
      return item;
    });

    function paintSwitcher() {
      const current = state.current;
      if (label) label.textContent = META[current].short;
      toggle.setAttribute('aria-label', `${ui('chooseLanguage')}: ${META[current].name}`);
      for (const option of options) {
        const active = option.dataset.lang === current;
        option.setAttribute('aria-selected', String(active));
        option.classList.toggle('is-active', active);
      }
    }

    function isOpen() {
      return !menu.hidden;
    }

    function open(focusSelected) {
      if (isOpen()) return;
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      if (focusSelected) {
        const active = options.find(option => option.getAttribute('aria-selected') === 'true') || options[0];
        active.focus();
      }
    }

    function close(refocus) {
      if (!isOpen()) return;
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (refocus) toggle.focus();
    }

    function choose(code) {
      close(true);
      if (code === state.current) return;
      set(code);
    }

    toggle.addEventListener('click', () => (isOpen() ? close(false) : open(false)));

    toggle.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        open(true);
      }
    });

    menu.addEventListener('click', event => {
      const option = event.target.closest('[data-lang]');
      if (option) choose(option.dataset.lang);
    });

    menu.addEventListener('keydown', event => {
      const index = options.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        options[(index + step + options.length) % options.length].focus();
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        options[event.key === 'Home' ? 0 : options.length - 1].focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (index >= 0) choose(options[index].dataset.lang);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      } else if (event.key === 'Tab') {
        close(false);
      }
    });

    document.addEventListener('click', event => {
      if (isOpen() && !event.target.closest('.language-switch')) close(false);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && isOpen()) close(true);
    });

    subscribe(paintSwitcher);
    paintSwitcher();
  }

  window.DragonI18n = {
    SUPPORTED,
    META,
    get current() { return state.current; },
    get locale() { return META[state.current].locale; },
    register, load, dict, ui, set, subscribe, ready
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindSwitcher);
  else bindSwitcher();
})();
