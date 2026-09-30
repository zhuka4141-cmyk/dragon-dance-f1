(() => {
  const textElements = [...document.querySelectorAll('[data-i18n]')];
  const htmlElements = [...document.querySelectorAll('[data-i18n-html]')];
  const englishText = Object.fromEntries(textElements.map(el => [el.dataset.i18n, el.textContent]));
  const englishHtml = Object.fromEntries(htmlElements.map(el => [el.dataset.i18nHtml, el.innerHTML]));
  const chineseText = {
        navTeam:'車隊',
        navHeritage:'大坑火龍',
        navCrew:'隊員',
        navPartners:'合作夥伴',
        heritageIntro:'每逢中秋，大坑街巷交織着紮作手藝、香火與眾人的步伐。舞火龍不只是一場表演，更是一項由街坊親手紮作、合力舞動，並代代相傳的活態文化。',
        heritageCaption:'以火龍的舞動與香火光點為靈感的藝術演繹。',
        heritageHistoryTitle:'從大坑街巷開始的故事',
        heritageHistoryCopy:'這項傳統可追溯至1880年。相傳當年大坑發生瘟疫，村民舞動火龍，祈求消災平安。這份守護家園的心意，延續成為凝聚街坊與不同世代的中秋習俗。',
        heritageTimelineOrigin:'大坑舞火龍傳統的起源。',
        heritageTimelineNational:'列入第三批國家級非物質文化遺產名錄。',
        heritageTimelineHK:'列入首份《香港非物質文化遺產代表作名錄》。',
        heritageCraftTitle:'是甚麼，讓火龍活起來？',
        heritageCraftIntro:'走近一點：萬點光芒的背後，是耐心的雙手、樸素的材料，以及同心前行的人。',
        heritageBodyTitle:'龍身・一草一結，親手紮作',
        heritageBodyCopy:'藤枝、繩索與珍珠草，每年重新紮成火龍，再以竹枝承托。巡遊前，工匠細心綁紮、塑形，調整每一部分的平衡。這份匠心，也啟發我們把設計一步步變成精密製作的賽車。',
        heritageIncenseTitle:'香火・萬點光芒，連成火龍',
        heritageIncenseCopy:'燃點的香枝插滿龍身，點點香火勾勒出火龍的輪廓。煙霧與香頭的光芒，共同構成舞火龍的獨特景象。網站的琥珀色光點與流動線條，取意於這些香火，而非噴火的神話巨龍。',
        heritageRhythmTitle:'節奏・龍珠引路，眾人同心',
        heritageRhythmCopy:'龍珠在前引路，鑼鼓帶動節奏；龍頭、龍身與龍尾的舞動者互相配合，讓長龍穿梭大坑街巷。這份默契啟發我們的設計、製造與管理成員，一起朝着同一條起跑線前進。',
        heritageBridgeCopy:'一條由街坊合力舞動的火龍，與一部由隊友共同打造的賽車，分享着協作的力量。匠心化作工程，節奏化作默契；傳統成為邀請，讓我們一起創作、一起前行。',
        heritageSourcesTitle:'走近這項活態文化',
        heritageSourceICH:'香港非物質文化遺產辦事處 ↗',
        heritageSourceCentre:'大坑火龍文化館 ↗',
        heritageSourceTourism:'香港旅遊發展局 ↗',
        heritageDisclaimer:'大坑舞火龍是 Dragon Dance STEM Racing 的文化靈感。我們是獨立學生車隊，並非大坑舞火龍的主辦單位或官方代表。',
    backToTeam:'返回車隊首頁',
    heritageFooter:'文化。匠心。同心。'
  };
  const chineseHtml = {
        heritageTitle:'一方街巷。<br>一條活起來的龍。',
        heritageBridgeTitle:'從街巷。<br>到起跑線。',
  };
  function applyLanguage(language) {
    const chinese = language === 'zh';
    const text = chinese ? chineseText : englishText;
    const html = chinese ? chineseHtml : englishHtml;
    textElements.forEach(el => { el.textContent = text[el.dataset.i18n]; });
    htmlElements.forEach(el => { el.innerHTML = html[el.dataset.i18nHtml]; });
    document.documentElement.lang = chinese ? 'zh-Hant' : 'en';
    document.title = chinese ? '大坑舞火龍 | Dragon Dance STEM Racing' : 'Tai Hang Fire Dragon Dance | Dragon Dance STEM Racing';
    document.querySelector('nav').setAttribute('aria-label', chinese ? '主要導覽' : 'Main navigation');
    document.querySelector('.language-switch').setAttribute('aria-label', chinese ? '語言選擇' : 'Language selector');
    document.getElementById('langEnglish').setAttribute('aria-pressed', String(!chinese));
    document.getElementById('langChinese').setAttribute('aria-pressed', String(chinese));
document.getElementById('heritageArtwork').alt = chinese ? '以香火光點勾勒火龍追隨龍珠的藝術演繹' : 'An artistic interpretation of an incense-lit dragon following a glowing pearl';
document.getElementById('heritageIchLink').href = `https://www.icho.hk/${chinese ? 'tc' : 'en'}/web/icho/representative_list_taihang.html`;
document.getElementById('heritageTourismLink').href = `https://www.discoverhongkong.com/${chinese ? 'tc' : 'eng'}/culture/what-to-expect-during-the-tai-hang-fire-dragon-dance.html`;
    try { localStorage.setItem('dragon-dance-language', chinese ? 'zh' : 'en'); } catch (_) {}
  }
  document.getElementById('langEnglish').addEventListener('click', () => applyLanguage('en'));
  document.getElementById('langChinese').addEventListener('click', () => applyLanguage('zh'));
  let language = 'en';
  try { language = localStorage.getItem('dragon-dance-language') || 'en'; } catch (_) {}
  applyLanguage(language);
})();
