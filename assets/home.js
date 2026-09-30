(() => {
      document.documentElement.classList.add('has-scroll-reveal');
      const hero = document.querySelector('.hero');
      const canvas = document.getElementById('fogField');
      const context = canvas.getContext('2d');
      const heroPages = document.getElementById('heroPages');
      const heroSlides = Array.from(heroPages.children);
      const aboutPageStack = document.getElementById('aboutPages');
      const aboutPages = Array.from(document.querySelectorAll('.about-page'));
      const featureStack = document.getElementById('machine');
      const featurePages = Array.from(document.querySelectorAll('.feature-page'));
      const pagerPrev = document.getElementById('pagerPrev');
      const pagerNext = document.getElementById('pagerNext');
      const pagerPrevLabel = document.getElementById('pagerPrevLabel');
      const pagerNextLabel = document.getElementById('pagerNextLabel');
      const langEnglish = document.getElementById('langEnglish');
      const langChinese = document.getElementById('langChinese');
      const partnershipTrigger = document.getElementById('partnershipTrigger');
      const partnershipModal = document.getElementById('partnershipModal');
      const partnershipBackdrop = document.getElementById('partnershipBackdrop');
      const partnershipClose = document.getElementById('partnershipClose');
      const homeUpdates = document.getElementById('homeUpdates');
      const updatesPreviewSection = document.getElementById('updates');
      const homeOnlyContent = document.getElementById('homeOnlyContent');
      const deadlineCountdowns = Array.from(document.querySelectorAll('.deadline-countdown'));
      const copyEmailButtons = Array.from(document.querySelectorAll('[data-copy-email]'));
      const pagerLabels = {
        en: [
          { prev:'', next:'Fire Dragon' },
          { prev:'Home', next:'Crew' },
          { prev:'Fire Dragon', next:'Partners' },
          { prev:'Crew', next:'' }
        ],
        zh: [
          { prev:'', next:'大坑火龍' },
          { prev:'首頁', next:'隊員' },
          { prev:'大坑火龍', next:'贊助商' },
          { prev:'隊員', next:'' }
        ]
      };
      const copyEmailMessages = {
        en: {
          copy:'Copy email address',
          copied:'Email address copied',
          failed:'Could not copy the email address. Please select and copy it.'
        },
        zh: {
          copy:'複製電郵地址',
          copied:'已複製電郵地址',
          failed:'未能複製電郵地址。請選取並複製。'
        }
      };
      const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let reduceMotion = motionPreference.matches;
      const wisps = [
        { x:.02, y:.18, radius:110, stretch:2.8, speed:7, wave:.42, alpha:.13 },
        { x:.28, y:.34, radius:145, stretch:3.2, speed:10, wave:.31, alpha:.11 },
        { x:.58, y:.2, radius:125, stretch:2.5, speed:8, wave:.38, alpha:.12 },
        { x:.78, y:.48, radius:170, stretch:3.4, speed:6, wave:.27, alpha:.1 },
        { x:.12, y:.66, radius:155, stretch:3.1, speed:9, wave:.33, alpha:.12 },
        { x:.45, y:.78, radius:135, stretch:2.7, speed:11, wave:.4, alpha:.1 },
        { x:.72, y:.82, radius:180, stretch:3.5, speed:5, wave:.25, alpha:.09 }
      ];
      let width = 0;
      let height = 0;
      let frame = 0;
      let visible = true;
      let clearPoints = [];
      let lastDraw = 0;
      let lastSample = { time:0, x:-1000, y:-1000 };
      let pageIndex = 0;
      let swipeStart = null;
      let suppressClickUntil = 0;
      let language = 'en';
      let languageAnimationTimer = 0;
      let pageAnimationTimer = 0;
      let updates = [];
      let updatesState = 'loading';
      let modalReturnFocus = null;
      let modalBackground = [];
      let scrollRevealObserver = null;
      const textElements = Array.from(document.querySelectorAll('[data-i18n]'));
      const htmlElements = Array.from(document.querySelectorAll('[data-i18n-html]'));
      const englishText = Object.fromEntries(textElements.map(element => [element.dataset.i18n, element.textContent]));
      const englishHtml = Object.fromEntries(htmlElements.map(element => [element.dataset.i18nHtml, element.innerHTML]));
      const chineseText = {
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
        heritageIndex:'02 / 大坑火龍',
        heritageHeroIntro:'走近大坑的活態傳統：親手紮作的火龍、萬點香火，以及街坊同心舞動的步伐。',
        deadlinesLabel:'賽事日程 / 2026 · Professional Class',
        deadlinesNote:'Professional Class 線上檔案與賽車交接的提交日期。',
        onlineFileTitle:'提交線上檔案',
        onlineFileCopy:'線上檔案最終提交期限。',
        carHandoverTitle:'交接賽車',
        carHandoverCopy:'交接完成的賽車，以供檢查。',
        november2026:'2026年11月',
        pagerHint:'滑動更換頁面',
        updatesLabel:'最新 / 動態',
        viewAllUpdates:'查看全部動態 ↗',
        updatesLoading:'正在載入最新動態...',
        updatesEmpty:'暫時未有動態，請稍後再回來看看。',
        readUpdate:'查看動態 ↗',
        heroKicker:'博愛醫院歷屆總理聯誼會梁省德中學 · STEM Racing',
        heroCopy:'萬點香火，眾人同心。香港舞火龍的節奏與默契，啟發我們走向起跑線。Dragon Dance 是一支把文化、匠心與速度連在一起的學生 STEM Racing 車隊。',
        f1StemLabel:'Dragon Dance / STEM Racing',
        heroMantra:'文化。匠心。同心。',
        navTeam:'車隊',
        navHeritage:'大坑火龍',
        navCrew:'隊員',
        navPartners:'合作夥伴',
        discoverHeritage:'認識大坑舞火龍',
        heroProvenance:'香港・大坑 — 啟發我們的傳統',
        scrollExplore:'向下探索 ↓',
        crewIndex:'03 / 隊員',
        crewIntro:'從專案管理、工程設計到品牌與贊助，隊員各自發揮專長，讓 Dragon Dance 同步前進。',
        partnersIndex:'04 / 贊助商',
        partnersIntro:'與重視創新、教育與青年發展的夥伴並肩，把工程實踐與品牌故事推上更大的舞台。',
        teamLabel:'01 / 車隊',
        teamOverview:'我們是博愛醫院歷屆總理聯誼會梁省德中學的 STEM Racing 車隊。以大坑舞火龍的同心精神為靈感，把香港文化連結工程、視覺設計與賽事策略。不同專長，同一方向。',
        baseLabel:'基地',
        programLabel:'項目',
        identityLabel:'精神',
        identityValue:'龍舞疾行',
        crewOverview:'Dragon Dance 由不同專長的隊員組成。從專案管理、工程設計到品牌與贊助，每一個角色都在同一個節奏中協作，讓想法真正站上賽道。',
        directionLabel:'方向',
        oneTeam:'同一隊伍',
        methodLabel:'方式',
        sharedOwnership:'共同承擔',
        energyLabel:'投入',
        fullCommitment:'全力以赴',
        partnersOverview:'每一份支持都讓 Dragon Dance 走得更遠。我們期待與重視創新、教育與青年發展的夥伴合作，把工程實踐與品牌故事一起帶到更大的舞台。',
        partnershipLabel:'合作',
        openLabel:'開放合作',
        reachLabel:'地點',
        contactLabel:'聯絡我們',
        emailUs:'電郵聯絡',
        machineLabel:'02 / 賽車',
        machineCopy:'每一個翼面、每一段車身輪廓，都在追求更乾淨的氣流、更少的阻力，以及一個明確的終點。',
        chassisLabel:'底盤',
        precisionCrafted:'精密打造',
        focusLabel:'重點',
        aerodynamics:'空氣動力學',
        raceMode:'比賽模式',
        fullAttack:'全力出擊',
        rolesLabel:'職責 / 分工',
        rolesCopy:'每個角色負責不同環節，從時間管理到賽車與品牌，彼此交接、互相補位。',
        crewMemberOne:'01 / 成員',
        crewMemberTwo:'02 / 成員',
        crewMemberThree:'03 / 成員',
        projectManager:'專案經理',
        projectManagerCopy:'協調進度、分工與比賽準備。',
        designEngineering:'設計與工程',
        designEngineeringCopy:'負責賽車設計、建模與測試。',
        manufacturing:'製造',
        manufacturingCopy:'把數位模型轉化為可上賽道的實體。',
        sponsorshipMarketing:'贊助與推廣',
        sponsorshipMarketingCopy:'建立合作關係與商業計劃。',
        brandMedia:'品牌與媒體',
        brandMediaCopy:'統一視覺、內容與對外溝通。',
        sponsorCopy:'與 Dragon Dance 合作，讓品牌走進校園 STEM 賽事、設計過程與下一次起跑。',
        sponsorshipLabel:'贊助 / 2026',
        partnershipKicker:'合作聯絡',
        partnershipModalCopy:'歡迎聯絡我們的隊伍，洽談贊助、品牌合作，以及支持 Dragon Dance 的不同方式。',
        sponsorshipManagerLabel:'贊助及推廣經理',
        proposalLabel:'2026 贊助提案',
        proposalTitle:'一起打造下一場賽事。',
        proposalCopy:'了解品牌曝光、校園活動、社交媒體故事與技術教育合作的可能性。',
        openProposal:'開啟贊助提案 PDF ↗',
        discussPartnership:'洽談合作',
        downloadProposal:'下載贊助提案 PDF ↓',
        visibilityIndex:'01 / 曝光',
        brandVisibility:'品牌曝光',
        brandVisibilityCopy:'在網站、提案與隊伍內容中呈現合作品牌。',
        campusIndex:'02 / 校園',
        campusActivation:'校園互動',
        campusActivationCopy:'連結校園活動、學生社群與 STEM 學習故事。',
        socialIndex:'03 / 社群',
        socialStorytelling:'社群故事',
        socialStorytellingCopy:'透過專案進度與 Instagram 分享品牌合作。',
        technicalIndex:'04 / 技術',
        teamDevelopment:'車隊發展',
        teamDevelopmentCopy:'支持設計、製造、測試與下一代創意人才。',
        racingCopy:'F1 Dragon Dance 是 Dragon Dance 在香港的 STEM Racing 身分。STEM Racing 是前稱 F1 in Schools 的學生賽車挑戰，我們在其中結合工程、設計、品牌與賽事策略。',
        footerTitle:'與龍<br>共舞。',
        emailLabel:'電郵',
        projectManagerContact:'專案經理 · 91639154',
        sponsorshipContact:'贊助及推廣經理 · 60116515',
        schoolWebsite:'學校網站'
      };
      const chineseHtml = {
        heritageTitle:'一方街巷。<br>一條活起來的龍。',
        heritageBridgeTitle:'從街巷。<br>到起跑線。',
        heritageHeroTitle:'大坑<br>舞火龍。',
        deadlinesTitle:'兩個日期。<br>同一條終點線。',
        updatesTitle:'持續<br>前進。',
        heroTitle:'薪火<br><i>疾行。</i>',
        crewTitle:'認識<br>隊員',
        partnersTitle:'支持<br>驅動。',
        machineTitle:'為起跑<br>而生。',
        rolesTitle:'一隊夥伴。<br>多種<br>專長。',
        sponsorTitle:'與我們<br>同行。',
        partnershipModalTitle:'與我們<br>合作。',
        racingTitle:'STEM Racing，<br><em>前稱 F1 in Schools。</em>',
        footerTitle:'與龍<br>共舞。',
        footerMeta:'博愛醫院歷屆總理聯誼會梁省德中學<br>香港'
      };

      function observeScrollReveal(element) {
        if (!element) return;
        if (reduceMotion || !scrollRevealObserver) {
          element.classList.add('is-visible');
          return;
        }
        scrollRevealObserver.observe(element);
      }

      function initScrollReveals() {
        const elements = Array.from(document.querySelectorAll('[data-scroll-reveal]'));
        if (reduceMotion || !('IntersectionObserver' in window)) {
          elements.forEach(element => element.classList.add('is-visible'));
          return;
        }
        scrollRevealObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            scrollRevealObserver.unobserve(entry.target);
          });
        }, { rootMargin:'0px 0px 8% 0px', threshold:.06 });
        elements.forEach(observeScrollReveal);
      }

      function updateText(post, field) {
        const value = post[field];
        if (typeof value === 'string') return value;
        return value?.[language] || value?.en || '';
      }

      function updateDate(value) {
        const date = new Date(`${value}T12:00:00`);
        if (Number.isNaN(date.getTime())) return value || '';
        return new Intl.DateTimeFormat(language === 'zh' ? 'zh-HK' : 'en-GB', {
          day:'2-digit', month:'short', year:'numeric'
        }).format(date);
      }

      function updateDeadlineCountdowns() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadlineCountdowns.forEach(element => {
          const [year, month, day] = String(element.dataset.deadline || '').split('-').map(Number);
          const deadline = new Date(year, month - 1, day);
          const days = Math.round((deadline - today) / 86400000);
          let label = '';
          if (days > 0) label = language === 'zh' ? `還有 ${days} 天` : `${days} days to go`;
          else if (days === 0) label = language === 'zh' ? '就是今天' : 'Today';
          else label = language === 'zh' ? '已完成' : 'Complete';
          element.textContent = label;
          element.setAttribute('aria-label', label);
        });
      }

      function syncCopyEmailControls() {
        const messages = copyEmailMessages[language];
        copyEmailButtons.forEach(button => {
          const copied = button.classList.contains('is-copied');
          const label = copied ? messages.copied : messages.copy;
          button.setAttribute('aria-label', label);
          button.title = label;
        });
      }

      function copyEmailFallback(value) {
        const field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0;pointer-events:none;';
        document.body.append(field);
        field.select();
        field.setSelectionRange(0, value.length);
        let copied = false;
        try { copied = document.execCommand('copy'); } catch (_) {}
        field.remove();
        return copied;
      }

      async function copyEmailAddress(button) {
        const value = button.dataset.copyEmail || '';
        const status = button.parentElement?.querySelector('[data-copy-email-status]');
        let copied = false;
        try {
          if (navigator.clipboard?.writeText && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            copied = true;
          } else {
            copied = copyEmailFallback(value);
          }
        } catch (_) {
          copied = copyEmailFallback(value);
        }

        const messages = copyEmailMessages[language];
        const label = copied ? messages.copied : messages.failed;
        button.classList.toggle('is-copied', copied);
        button.setAttribute('aria-label', label);
        button.title = label;
        if (status) status.textContent = label;
        window.clearTimeout(Number(button.dataset.copyEmailTimer || 0));
        button.dataset.copyEmailTimer = String(window.setTimeout(() => {
          button.classList.remove('is-copied');
          button.setAttribute('aria-label', copyEmailMessages[language].copy);
          button.title = copyEmailMessages[language].copy;
          if (status) status.textContent = '';
        }, 1800));
      }

      function isVideoUrl(url) {
        return /\.(?:mp4|webm|ogg)(?:[?#].*)?$/i.test(String(url || ''));
      }

      function parseMediaEntry(value) {
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        if (!trimmed.startsWith('{')) return value;
        try {
          const parsed = JSON.parse(trimmed);
          return parsed && typeof parsed.url === 'string' ? parsed : value;
        } catch {
          return value;
        }
      }

      function mediaUrl(entry) {
        const value = parseMediaEntry(entry);
        if (typeof value === 'string') return value;
        const url = parseMediaEntry(value?.url);
        return typeof url === 'string' ? url : url?.url || '';
      }

      function normaliseMediaPosition(value) {
        const number = Number(value);
        return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 50;
      }

      function normaliseMediaEntries(row) {
        const raw = Array.isArray(row?.image_urls) ? row.image_urls : [];
        const entries = raw.map(value => {
          value = parseMediaEntry(value);
          if (typeof value === 'string') return { url:value, positionX:50, positionY:50, scale:1 };
          if (!value || typeof value.url !== 'string') return null;
          return {
            ...value,
            positionX:normaliseMediaPosition(value.positionX ?? value.position_x ?? 50),
            positionY:normaliseMediaPosition(value.positionY ?? value.position_y ?? 50),
            scale:Math.min(3, Math.max(1, Number(value.scale ?? 1) || 1))
          };
        }).filter(Boolean);
        const coverUrl = mediaUrl(row?.cover_url);
        if (!entries.length && coverUrl) entries.push({ url:coverUrl, positionX:50, positionY:50, scale:1 });
        const seen = new Set();
        return entries.filter(entry => {
          const url = mediaUrl(entry);
          if (!url || seen.has(url)) return false;
          seen.add(url);
          return true;
        });
      }

      function mediaNaturalSize(media) {
        const video = media?.tagName === 'VIDEO';
        const width = video ? media.videoWidth : media.naturalWidth;
        const height = video ? media.videoHeight : media.naturalHeight;
        return width > 0 && height > 0 ? { width, height } : null;
      }

      function layoutCroppedMedia(media, entry, frame = media?.parentElement) {
        const natural = mediaNaturalSize(media);
        const frameWidth = frame?.clientWidth || 0;
        const frameHeight = frame?.clientHeight || 0;
        if (!entry || !natural || !frameWidth || !frameHeight) return;
        const scale = Math.min(3, Math.max(1, Number(entry.scale) || 1));
        const baseScale = Math.max(frameWidth / natural.width, frameHeight / natural.height);
        const width = natural.width * baseScale * scale;
        const height = natural.height * baseScale * scale;
        const overflowX = Math.max(0, width - frameWidth);
        const overflowY = Math.max(0, height - frameHeight);
        const positionX = normaliseMediaPosition(entry.positionX);
        const positionY = normaliseMediaPosition(entry.positionY);
        media.style.position = 'absolute';
        media.style.inset = 'auto';
        media.style.left = `${overflowX ? -(overflowX * positionX / 100) : (frameWidth - width) / 2}px`;
        media.style.top = `${overflowY ? -(overflowY * positionY / 100) : (frameHeight - height) / 2}px`;
        media.style.width = `${width}px`;
        media.style.height = `${height}px`;
        media.style.maxWidth = 'none';
        media.style.maxHeight = 'none';
        media.style.objectFit = 'fill';
        media.style.objectPosition = '50% 50%';
        media.style.transform = 'none';
      }

      function applyMediaLayout(media, entry) {
        if (!entry) return;
        media._cropEntry = entry;
        media.dataset.croppedMedia = 'true';
        const layout = () => layoutCroppedMedia(media, media._cropEntry);
        if (!media._cropLayoutBound) {
          media.addEventListener(media.tagName === 'VIDEO' ? 'loadedmetadata' : 'load', layout);
          media._cropLayoutBound = true;
        }
        window.requestAnimationFrame(layout);
      }

      let mediaLayoutResizeFrame = 0;
      window.addEventListener('resize', () => {
        window.cancelAnimationFrame(mediaLayoutResizeFrame);
        mediaLayoutResizeFrame = window.requestAnimationFrame(() => {
          document.querySelectorAll('[data-cropped-media="true"]').forEach(media => {
            layoutCroppedMedia(media, media._cropEntry);
          });
        });
      });

      function renderHomeUpdates() {
        if (!homeUpdates) return;
        homeUpdates.replaceChildren();
        if (window.DragonUpdates.renderStatus(homeUpdates, updatesState, language, loadUpdates)) return;
        const posts = updates.slice(0, 3);
        posts.forEach((post, index) => {
          const card = document.createElement('a');
          card.className = `update-preview-card${index === 0 ? ' is-featured' : ''}${index === 2 ? ' is-last' : ''}`;
          card.dataset.scrollReveal = '';
          card.style.setProperty('--scroll-reveal-delay', `${index * 80}ms`);
          card.href = `updates.html#${encodeURIComponent(post.id || '')}`;
          const title = updateText(post, 'title');
          card.setAttribute('aria-label', `${language === 'zh' ? '查看動態：' : 'Read update: '}${title}`);

          if (post.cover) {
            const media = document.createElement('span');
            media.className = 'update-preview-media';
            const coverUrl = mediaUrl(post.cover);
            const coverMedia = isVideoUrl(coverUrl) ? document.createElement('video') : document.createElement('img');
            window.DragonUpdates.protectMedia(coverMedia, language);
            coverMedia.src = coverUrl;
            coverMedia.decoding = 'async';
            applyMediaLayout(coverMedia, post.cover);
            if (coverMedia.tagName === 'VIDEO') {
              coverMedia.muted = true;
              coverMedia.playsInline = true;
              coverMedia.preload = 'metadata';
            } else {
              coverMedia.alt = title;
              coverMedia.loading = 'lazy';
              coverMedia.width = 800;
              coverMedia.height = 600;
            }
            media.append(coverMedia);
            card.append(media);
          }

          const copy = document.createElement('span');
          copy.className = 'update-preview-copy';
          if (post.isPinned) {
            const pin = document.createElement('span');
            pin.className = 'update-preview-pin';
            pin.textContent = language === 'zh' ? '置頂' : 'Pinned';
            copy.append(pin);
          }
          const date = document.createElement('span');
          date.className = 'update-preview-date';
          date.textContent = updateDate(post.published);
          const heading = document.createElement('span');
          heading.className = 'update-preview-heading';
          const headingText = document.createElement('span');
          headingText.textContent = title;
          heading.append(headingText);
          const more = document.createElement('span');
          more.className = 'update-preview-more';
          more.textContent = language === 'zh' ? '查看動態 ↗' : 'Read update ↗';
          copy.append(date, heading, more);
          card.append(copy);
          homeUpdates.append(card);
          observeScrollReveal(card);
        });
      }

      function mapUpdate(row) {
        const images = normaliseMediaEntries(row);
        return {
          id:row.slug,
          published:row.published_at,
          isPinned:Boolean(row.is_pinned),
          cover:images[0] || row.cover_url,
          title:{ en:row.title_en, zh:row.title_zh },
          body:{ en:row.body_en, zh:row.body_zh }
        };
      }

      async function loadUpdates() {
        updatesState = 'loading';
        renderHomeUpdates();
        try {
          updates = (await window.DragonUpdates.load(3)).map(mapUpdate);
          updatesState = updates.length ? 'ready' : 'empty';
        } catch (_) {
          updates = [];
          updatesState = 'error';
        }
        renderHomeUpdates();
      }

      function openPartnershipModal() {
        modalReturnFocus = document.activeElement;
        partnershipModal.inert = false;
        partnershipModal.classList.add('is-open');
        partnershipModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('has-modal');
        partnershipClose.focus();
        modalBackground = Array.from(document.body.children)
          .filter(element => element !== partnershipModal && !['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName))
          .map(element => ({element, inert:element.inert}));
        modalBackground.forEach(({element}) => { element.inert = true; });
      }

      function closePartnershipModal() {
        if (!partnershipModal.classList.contains('is-open')) return;
        modalBackground.forEach(({element, inert}) => { element.inert = inert; });
        modalBackground = [];
        const target = modalReturnFocus?.isConnected && !modalReturnFocus.closest('[inert], [hidden]')
          ? modalReturnFocus : document.querySelector('.site-sections [aria-pressed="true"]');
        target?.focus({preventScroll:true});
        partnershipModal.inert = true;
        partnershipModal.classList.remove('is-open');
        partnershipModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('has-modal');
      }

      function handleModalKeydown(event) {
        if (!partnershipModal.classList.contains('is-open')) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          closePartnershipModal();
          return;
        }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(partnershipModal.querySelectorAll('a[href], button:not([disabled])')).filter(element => element.tabIndex >= 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }

      function applyLanguage(nextLanguage, animate = true) {
        const next = nextLanguage === 'zh' ? 'zh' : 'en';
        const languageChanged = language !== next;
        language = next;
        const text = language === 'zh' ? chineseText : englishText;
        const html = language === 'zh' ? chineseHtml : englishHtml;
        textElements.forEach(element => {
          const value = text[element.dataset.i18n];
          if (value) element.textContent = value;
        });
        htmlElements.forEach(element => {
          const value = html[element.dataset.i18nHtml];
          if (value) element.innerHTML = value;
        });

        const chinese = language === 'zh';
        document.documentElement.lang = chinese ? 'zh-Hant' : 'en';
        hero.setAttribute('aria-label', chinese ? 'Dragon Dance 首頁' : 'Dragon Dance homepage');
        heroSlides.forEach((slide, index) => slide.setAttribute('aria-label', chinese ? `第 ${index + 1} 頁` : `Page ${index + 1}`));
        document.getElementById('dragonStage').setAttribute('aria-label', chinese ? '可互動的龍圖案' : 'Interactive Dragon Dance dragon symbol');
        document.getElementById('dragon').alt = chinese ? 'Dragon Dance 龍圖案' : 'Dragon Dance dragon symbol';
        document.querySelector('.car-photo').dataset.label = chinese ? '01 / 龍舞原型' : '01 / DRAGON PROTOTYPE';
        document.querySelector('.footer-contact').setAttribute('aria-label', chinese ? '聯絡我們' : 'Contact');
        partnershipClose.setAttribute('aria-label', chinese ? '關閉對話框' : 'Close dialog');
        partnershipBackdrop.setAttribute('aria-label', chinese ? '關閉對話框' : 'Close dialog');
        document.getElementById('heritageArtwork').alt = chinese ? '以香火光點勾勒火龍追隨龍珠的藝術演繹' : 'An artistic interpretation of an incense-lit dragon following a glowing pearl';
        document.getElementById('heritageIchLink').href = `https://www.icho.hk/${chinese ? 'tc' : 'en'}/web/icho/representative_list_taihang.html`;
        document.getElementById('heritageTourismLink').href = `https://www.discoverhongkong.com/${chinese ? 'tc' : 'eng'}/culture/what-to-expect-during-the-tai-hang-fire-dragon-dance.html`;
        langEnglish.setAttribute('aria-pressed', String(!chinese));
        langChinese.setAttribute('aria-pressed', String(chinese));
        syncCopyEmailControls();
        try { window.localStorage.setItem('dragon-dance-language', language); } catch (_) {}
        setPage(pageIndex);
        updateDeadlineCountdowns();
        renderHomeUpdates();
        if (languageChanged && animate && !reduceMotion) {
          document.body.classList.remove('is-language-switching');
          void document.body.offsetWidth;
          document.body.classList.add('is-language-switching');
          window.clearTimeout(languageAnimationTimer);
          languageAnimationTimer = window.setTimeout(() => document.body.classList.remove('is-language-switching'), 460);
        }
      }

      function renderTrack(offset = 0) {
        if (!offset) {
          heroPages.style.transform = `translate3d(-${pageIndex * 100}%,0,0)`;
          return;
        }
        const adjustment = offset > 0 ? ` + ${offset}px` : ` - ${Math.abs(offset)}px`;
        heroPages.style.transform = `translate3d(calc(-${pageIndex * 100}%${adjustment}),0,0)`;
      }

      function setHomeOnlyContentVisibility(show) {
        homeOnlyContent.hidden = !show;
        homeOnlyContent.inert = !show;
        homeOnlyContent.setAttribute('aria-hidden', String(!show));
      }

      function setPage(nextIndex) {
        const pageChanged = pageIndex !== Math.max(0, Math.min(nextIndex, heroSlides.length - 1));
        pageIndex = Math.max(0, Math.min(nextIndex, heroSlides.length - 1));
        if (pageChanged) window.scrollTo({top:0, behavior:'instant'});
        renderTrack();
        updateFogState();
        heroPages.dataset.page = String(pageIndex + 1);
        const prevHidden = pageIndex === 0;
        const nextHidden = pageIndex === heroSlides.length - 1;
        pagerPrev.classList.toggle('is-hidden', prevHidden);
        pagerNext.classList.toggle('is-hidden', nextHidden);
        pagerPrev.setAttribute('aria-hidden', String(prevHidden));
        pagerNext.setAttribute('aria-hidden', String(nextHidden));
        pagerPrev.tabIndex = prevHidden ? -1 : 0;
        pagerNext.tabIndex = nextHidden ? -1 : 0;
        const labels = pagerLabels[language][pageIndex];
        const previousPage = language === 'zh' ? '上一頁' : 'Previous page';
        const nextPage = language === 'zh' ? '下一頁' : 'Next page';
        pagerPrevLabel.textContent = labels.prev;
        pagerNextLabel.textContent = labels.next;
        pagerPrev.title = labels.prev ? `${previousPage} / ${labels.prev}` : previousPage;
        pagerNext.title = labels.next ? `${nextPage} / ${labels.next}` : nextPage;
        pagerPrev.setAttribute('aria-label', labels.prev ? `${previousPage}: ${labels.prev}` : previousPage);
        pagerNext.setAttribute('aria-label', labels.next ? `${nextPage}: ${labels.next}` : nextPage);
        heroSlides.forEach((slide, index) => {
          slide.setAttribute('aria-hidden', String(index !== pageIndex));
          slide.inert = index !== pageIndex;
        });
        document.querySelectorAll('.site-sections button[data-page-target]').forEach(button => {
          button.setAttribute('aria-pressed', String(Number(button.dataset.pageTarget) === pageIndex));
        });
        aboutPages.forEach((panel, index) => {
          const active = Number(panel.dataset.pagePanel) === pageIndex;
          panel.classList.toggle('is-active', active);
          panel.setAttribute('aria-hidden', String(!active));
          panel.inert = !active;
        });
        featurePages.forEach((panel, index) => {
          const active = Number(panel.dataset.pagePanel) === pageIndex;
          panel.classList.toggle('is-active', active);
          panel.setAttribute('aria-hidden', String(!active));
          panel.inert = !active;
        });
        const cultureActive = pageIndex === 1;
        document.getElementById('heritage').hidden = !cultureActive;
        document.getElementById('about').hidden = cultureActive;
        featureStack.hidden = cultureActive;
        const showHomeOnlySections = pageIndex === 0;
        setHomeOnlyContentVisibility(showHomeOnlySections);
        if (updatesPreviewSection) {
          updatesPreviewSection.classList.toggle('is-hidden-from-pager', !showHomeOnlySections);
          updatesPreviewSection.inert = !showHomeOnlySections;
          updatesPreviewSection.setAttribute('aria-hidden', String(!showHomeOnlySections));
        }
        const focus = document.activeElement;
        if (focus?.closest('[inert], [hidden], [aria-hidden="true"]')) {
          document.querySelector(`.site-sections [data-page-target="${pageIndex}"]`)?.focus({preventScroll:true});
        }
        if (pageChanged && !reduceMotion) {
          [aboutPageStack, featureStack].forEach(stack => {
            stack.classList.remove('is-page-switching');
            void stack.offsetWidth;
            stack.classList.add('is-page-switching');
          });
          window.clearTimeout(pageAnimationTimer);
          pageAnimationTimer = window.setTimeout(() => {
            aboutPageStack.classList.remove('is-page-switching');
            featureStack.classList.remove('is-page-switching');
          }, 700);
        }
      }

      function beginSwipe(event) {
        if (document.body.classList.contains('has-modal')) return;
        if (event.target.closest('a, button, input, select, textarea, summary, [role="dialog"]')) return;
        if (event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;
        swipeStart = { id:event.pointerId, x:event.clientX, y:event.clientY, axis:null, moved:false, scrollY:window.scrollY };
        heroPages.classList.add('is-dragging');
      }

      function moveSwipe(event) {
        if (!swipeStart || swipeStart.id !== event.pointerId) return;
        const deltaX = event.clientX - swipeStart.x;
        const deltaY = event.clientY - swipeStart.y;
        if (!swipeStart.axis) {
          if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return;
          swipeStart.axis = Math.abs(deltaX) > Math.abs(deltaY) * 1.1 ? 'horizontal' : 'vertical';
        }
        if (swipeStart.axis !== 'horizontal') return;
        if (event.cancelable) event.preventDefault();
        const atBoundary = (pageIndex === 0 && deltaX > 0) || (pageIndex === heroSlides.length - 1 && deltaX < 0);
        if (!reduceMotion) renderTrack(deltaX * (atBoundary ? .22 : 1));
        swipeStart.moved = true;
      }

      function finishSwipe(event) {
        if (!swipeStart || swipeStart.id !== event.pointerId) return;
        const gesture = swipeStart;
        const deltaX = event.clientX - gesture.x;
        const deltaY = event.clientY - gesture.y;
        swipeStart = null;
        heroPages.classList.remove('is-dragging');
        if (gesture.axis === 'horizontal' && window.scrollY !== gesture.scrollY) window.scrollTo(0, gesture.scrollY);
        if (gesture.axis !== 'horizontal') {
          renderTrack();
          return;
        }
        if (gesture.moved) suppressClickUntil = performance.now() + 350;
        const threshold = Math.min(56, Math.max(30, hero.clientWidth * .1));
        const changedPage = Math.abs(deltaX) >= threshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.1;
        if (changedPage) {
          setPage(pageIndex + (deltaX < 0 ? 1 : -1));
        } else {
          renderTrack();
        }
      }

      function cancelSwipe() {
        if (!swipeStart) return;
        const gesture = swipeStart;
        swipeStart = null;
        heroPages.classList.remove('is-dragging');
        if (gesture.axis === 'horizontal' && window.scrollY !== gesture.scrollY) window.scrollTo(0, gesture.scrollY);
        renderTrack();
      }

      function resizeFog() {
        if (!context) return;
        width = hero.clientWidth;
        height = hero.clientHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        updateFogState();
      }

      function drawWisp(wisp, index, seconds) {
        const travel = width * 1.55;
        const drift = reduceMotion ? 0 : seconds * wisp.speed;
        const x = ((wisp.x * travel + drift) % travel) - width * .22;
        const y = wisp.y * height + (reduceMotion ? 0 : Math.sin(seconds * wisp.wave + index) * 15);
        const gradient = context.createRadialGradient(x, y, 0, x, y, wisp.radius);
        gradient.addColorStop(0, `rgba(214,224,219,${wisp.alpha})`);
        gradient.addColorStop(.48, `rgba(191,205,201,${wisp.alpha * .58})`);
        gradient.addColorStop(1, 'rgba(170,188,184,0)');
        context.save();
        context.translate(x, y);
        context.scale(wisp.stretch, 1);
        context.translate(-x, -y);
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, wisp.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      function clearFog(now) {
        clearPoints = clearPoints.filter(point => now - point.created < 1150);
        context.globalCompositeOperation = 'destination-out';
        clearPoints.forEach(point => {
          const progress = Math.min((now - point.created) / 1150, 1);
          const radius = point.radius + progress * 38;
          const strength = .94 * (1 - progress);
          const gradient = context.createRadialGradient(point.x, point.y, radius * .18, point.x, point.y, radius);
          gradient.addColorStop(0, `rgba(0,0,0,${strength})`);
          gradient.addColorStop(.58, `rgba(0,0,0,${strength * .72})`);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          context.fillStyle = gradient;
          context.beginPath();
          context.arc(point.x, point.y, radius, 0, Math.PI * 2);
          context.fill();
        });
        context.globalCompositeOperation = 'source-over';
      }

      function fogCanAnimate() {
        return context && width && height && visible && pageIndex === 0 && !document.hidden && !reduceMotion;
      }

      function paintFog(now) {
        context.clearRect(0, 0, width, height);
        wisps.forEach((wisp, index) => drawWisp(wisp, index, now / 1000));
        clearFog(now);
      }

      function updateFogState() {
        cancelAnimationFrame(frame);
        frame = 0;
        const paused = !fogCanAnimate();
        hero.classList.toggle('is-effects-paused', paused);
        canvas.hidden = pageIndex !== 0;
        if (!paused) frame = requestAnimationFrame(drawFog);
        else {
          clearPoints = [];
          if (context && width && height && visible && pageIndex === 0 && !document.hidden) paintFog(0);
        }
      }

      function drawFog(now) {
        frame = 0;
        if (!fogCanAnimate()) return;
        if (now - lastDraw < 32) {
          frame = requestAnimationFrame(drawFog);
          return;
        }
        lastDraw = now;
        paintFog(now);
        frame = requestAnimationFrame(drawFog);
      }

      function disperseFog(event) {
        if (!fogCanAnimate()) return;
        const bounds = hero.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;
        const now = performance.now();
        const distance = Math.hypot(x - lastSample.x, y - lastSample.y);
        if (event.type === 'pointermove' && now - lastSample.time < 34 && distance < 22) return;
        clearPoints.push({ x, y, radius:event.pointerType === 'touch' ? 104 : 82, created:now });
        if (clearPoints.length > 28) clearPoints.shift();
        lastSample = { time:now, x, y };
      }

      let savedLanguage = 'en';
      try { savedLanguage = window.localStorage.getItem('dragon-dance-language') || 'en'; } catch (_) {}
      initScrollReveals();
      applyLanguage(savedLanguage === 'zh' ? 'zh' : 'en', false);
      loadUpdates();
      resizeFog();
      window.addEventListener('resize', resizeFog, { passive:true });
      hero.addEventListener('pointerdown', disperseFog, { passive:true });
      hero.addEventListener('pointermove', disperseFog, { passive:true });
      document.addEventListener('visibilitychange', updateFogState);
      motionPreference.addEventListener('change', event => {
        reduceMotion = event.matches;
        if (reduceMotion) {
          scrollRevealObserver?.disconnect();
          document.querySelectorAll('[data-scroll-reveal]').forEach(element => element.classList.add('is-visible'));
        }
        updateFogState();
      });
      document.addEventListener('pointerdown', beginSwipe, { passive:true });
      document.addEventListener('pointermove', moveSwipe, { passive:false });
      document.addEventListener('pointerup', finishSwipe, { passive:true });
      document.addEventListener('pointercancel', cancelSwipe, { passive:true });
      document.addEventListener('click', event => {
        if (performance.now() >= suppressClickUntil) return;
        suppressClickUntil = 0;
        event.preventDefault();
        event.stopPropagation();
      }, true);
      pagerPrev.addEventListener('click', () => setPage(pageIndex - 1));
      pagerNext.addEventListener('click', () => setPage(pageIndex + 1));
      document.querySelectorAll('[data-page-target]').forEach(control => {
        control.addEventListener('click', () => {
          setPage(Number(control.dataset.pageTarget));
          if (control.tagName === 'BUTTON') window.scrollTo({top:0, behavior:'instant'});
        });
      });
      document.querySelector('.wordmark').addEventListener('click', () => setPage(0));
      function followPageLink() {
        const routes = { '#heritage':1, '#crew':2, '#partners':3, '#top':0 };
        if (Object.hasOwn(routes, location.hash)) setPage(routes[location.hash]);
      }
      window.addEventListener('hashchange', followPageLink);
      followPageLink();
      langEnglish.addEventListener('click', () => applyLanguage('en'));
      langChinese.addEventListener('click', () => applyLanguage('zh'));
      partnershipTrigger.addEventListener('click', openPartnershipModal);
      partnershipBackdrop.addEventListener('click', closePartnershipModal);
      partnershipClose.addEventListener('click', closePartnershipModal);
      copyEmailButtons.forEach(button => button.addEventListener('click', () => copyEmailAddress(button)));
      document.addEventListener('keydown', handleModalKeydown);
      hero.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' && pageIndex > 0) {
          event.preventDefault();
          setPage(pageIndex - 1);
        }
        if (event.key === 'ArrowRight' && pageIndex < heroSlides.length - 1) {
          event.preventDefault();
          setPage(pageIndex + 1);
        }
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          visible = entries[0].isIntersecting;
          updateFogState();
        }, { threshold:.01 }).observe(hero);
      } else {
        updateFogState();
      }
    })();
