/* Admin helper: type in one language and the other fills in through MyMemory (free, no key).
   The target is only overwritten while it is empty or still holds text this script put there,
   so anything edited by hand is left alone. Failures never block the form. */
(() => {
  const ENDPOINT = 'https://api.mymemory.translated.net/get';
  const MAX_BYTES = 450; // MyMemory rejects queries over 500 bytes
  const DEBOUNCE = Number(window.ADMIN_TRANSLATE_DEBOUNCE) || 900;
  const PAIRS = [
    ['titleEn', 'titleZh', 'en', 'zh-TW'],
    ['titleZh', 'titleEn', 'zh-TW', 'en'],
    ['bodyEn', 'bodyZh', 'en', 'zh-TW'],
    ['bodyZh', 'bodyEn', 'zh-TW', 'en']
  ];
  const hint = document.getElementById('translateHint');
  const auto = {};   // field id -> the text this script last wrote there
  const timers = {}; // source id -> debounce timer
  const seq = {};    // source id -> request counter, bumped on every keystroke

  function say(text, kind) {
    if (!hint) return;
    hint.textContent = text;
    hint.className = 'translate-hint' + (kind ? ' ' + kind : '');
  }

  function bytes(text) {
    let total = 0;
    for (const ch of text) {
      const code = ch.codePointAt(0);
      total += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    }
    return total;
  }

  /* Split a paragraph on sentence ends into pieces under the byte limit. */
  function chunk(paragraph) {
    if (bytes(paragraph) <= MAX_BYTES) return [paragraph];
    const sentences = paragraph.match(/[^.!?。！？；;]+[.!?。！？；;]*\s*/g) || [paragraph];
    const out = [];
    let current = '';
    for (const sentence of sentences) {
      if (bytes(current + sentence) <= MAX_BYTES) { current += sentence; continue; }
      if (current) out.push(current);
      current = '';
      for (const ch of sentence) {
        if (bytes(current + ch) > MAX_BYTES) { out.push(current); current = ''; }
        current += ch;
      }
    }
    if (current) out.push(current);
    return out;
  }

  function decode(text) {
    const box = document.createElement('textarea');
    box.innerHTML = text;
    return box.value;
  }

  async function translateChunk(query, from, to) {
    const url = `${ENDPOINT}?q=${encodeURIComponent(query)}&langpair=${encodeURIComponent(from + '|' + to)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('http ' + response.status);
    const data = await response.json();
    const text = data && data.responseData && data.responseData.translatedText;
    if (String(data.responseStatus) !== '200' || !text || /^MYMEMORY WARNING/i.test(text)) {
      throw new Error('quota or bad response');
    }
    const result = decode(text).trim();
    // Short phrases sometimes come back untranslated; never fill a Chinese field with English.
    if (to === 'zh-TW' && /[A-Za-z]{3,}/.test(query) && !/[一-鿿]/.test(result)) {
      throw new Error('not translated');
    }
    return result;
  }

  async function translateText(text, from, to) {
    const glue = to === 'en' ? ' ' : '';
    const lines = [];
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) { lines.push(''); continue; }
      const parts = [];
      for (const piece of chunk(line)) parts.push(await translateChunk(piece.trim(), from, to));
      lines.push(parts.join(glue));
    }
    return lines.join('\n');
  }

  const writable = target => target.value === '' || target.value === auto[target.id];

  async function run(pair, mine) {
    const [srcId, dstId, from, to] = pair;
    const src = document.getElementById(srcId);
    const dst = document.getElementById(dstId);
    if (!src || !dst || !src.value.trim() || !writable(dst)) return;
    say('自動翻譯中…');
    try {
      const out = await translateText(src.value, from, to);
      if (mine !== seq[srcId]) return;
      if (!writable(dst)) { say(''); return; } // edited by hand while we waited
      dst.value = out;
      auto[dstId] = out;
      say('已自動翻譯，可直接修改。', 'ok');
    } catch (_) {
      if (mine === seq[srcId]) say('自動翻譯暫時無法使用，請手動輸入。', 'error');
    }
  }

  for (const pair of PAIRS) {
    const [srcId, dstId] = pair;
    const src = document.getElementById(srcId);
    const dst = document.getElementById(dstId);
    if (!src || !dst) continue;
    seq[srcId] = 0;
    src.addEventListener('input', () => {
      const mine = ++seq[srcId];
      clearTimeout(timers[srcId]);
      if (!src.value.trim()) {
        if (auto[dstId] !== undefined && dst.value === auto[dstId]) dst.value = '';
        delete auto[dstId];
        say('');
        return;
      }
      timers[srcId] = setTimeout(() => run(pair, mine), DEBOUNCE);
    });
  }

  window.AdminTranslate = {
    /* Called when the form is cleared or an existing post is loaded. */
    reset() {
      for (const key of Object.keys(auto)) delete auto[key];
      for (const key of Object.keys(timers)) clearTimeout(timers[key]);
      for (const key of Object.keys(seq)) seq[key]++;
      say('');
    }
  };
})();
