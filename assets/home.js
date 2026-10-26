(() => {
      document.documentElement.classList.add('has-scroll-reveal');
      const hero = document.querySelector('.hero');
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
      const partnershipTrigger = document.getElementById('partnershipTrigger');
      const partnershipModal = document.getElementById('partnershipModal');
      const partnershipBackdrop = document.getElementById('partnershipBackdrop');
      const partnershipClose = document.getElementById('partnershipClose');
      const homeUpdates = document.getElementById('homeUpdates');
      const updatesPreviewSection = document.getElementById('updates');
      const homeOnlyContent = document.getElementById('homeOnlyContent');
      const deadlineCountdowns = Array.from(document.querySelectorAll('.deadline-countdown'));
      const copyEmailButtons = Array.from(document.querySelectorAll('[data-copy-email]'));
      const pagerLabelKeys = [
        { prev:'', next:'pagerHeritage' },
        { prev:'pagerHome', next:'pagerCrew' },
        { prev:'pagerHeritage', next:'pagerPartners' },
        { prev:'pagerCrew', next:'' }
      ];
      const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let reduceMotion = motionPreference.matches;
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
      const ui = (key, vars) => DragonI18n.ui(key, vars);

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
        return value?.[language.startsWith('zh') ? 'zh' : 'en'] || value?.en || '';
      }

      function updateDate(value) {
        const date = new Date(`${value}T12:00:00`);
        if (Number.isNaN(date.getTime())) return value || '';
        return new Intl.DateTimeFormat(DragonI18n.locale, {
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
                    if (days > 0) label = ui('daysToGo', { n: days });
          else if (days === 0) label = ui('today');
          else label = ui('complete');
          element.textContent = label;
          element.setAttribute('aria-label', label);
        });
      }

      function syncCopyEmailControls() {
                copyEmailButtons.forEach(button => {
          const copied = button.classList.contains('is-copied');
          const label = copied ? ui('emailCopied') : ui('copyEmail');
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

                const label = copied ? ui('emailCopied') : ui('emailCopyFailed');
        button.classList.toggle('is-copied', copied);
        button.setAttribute('aria-label', label);
        button.title = label;
        if (status) status.textContent = label;
        window.clearTimeout(Number(button.dataset.copyEmailTimer || 0));
        button.dataset.copyEmailTimer = String(window.setTimeout(() => {
          button.classList.remove('is-copied');
          button.setAttribute('aria-label', ui('copyEmail'));
          button.title = ui('copyEmail');
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
          card.setAttribute('aria-label', `${ui('readUpdateLabel')}${title}`);

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
            pin.textContent = ui('pinned');
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
          more.textContent = ui('readUpdate');
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
        const next = DragonI18n.SUPPORTED.includes(nextLanguage) ? nextLanguage : 'en';
        const languageChanged = language !== next;
        language = next;
        const table = DragonI18n.dict(next);
        const text = table.text || {};
        const html = table.html || {};
        textElements.forEach(element => {
          const key = element.dataset.i18n;
          const value = text[key] ?? englishText[key];
          if (value) element.textContent = value;
        });
        htmlElements.forEach(element => {
          const key = element.dataset.i18nHtml;
          const value = html[key] ?? englishHtml[key];
          if (value) element.innerHTML = value;
        });

        const chinese = next.startsWith('zh');
        document.documentElement.lang = DragonI18n.META[next].htmlLang;
        hero.setAttribute('aria-label', ui('homepageLabel'));
        heroSlides.forEach((slide, index) => slide.setAttribute('aria-label', ui('pageLabel', { n: index + 1 })));
        document.getElementById('dragonStage').setAttribute('aria-label', ui('dragonStageLabel'));
        document.getElementById('dragon').alt = ui('dragonAlt');
        document.querySelector('.car-photo').dataset.label = ui('carPhotoLabel');
        document.querySelector('.footer-contact').setAttribute('aria-label', ui('contactLabel'));
        partnershipClose.setAttribute('aria-label', ui('closeDialog'));
        partnershipBackdrop.setAttribute('aria-label', ui('closeDialog'));
        document.getElementById('heritageArtwork').alt = ui('artworkAlt');
        document.getElementById('heritageIchLink').href = 'https://www.icho.hk/' + (chinese ? 'tc' : 'en') + '/web/icho/representative_list_taihang.html';
        document.getElementById('heritageTourismLink').href = 'https://www.discoverhongkong.com/' + (chinese ? 'tc' : 'eng') + '/culture/what-to-expect-during-the-tai-hang-fire-dragon-dance.html';
        syncCopyEmailControls();
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
        heroPages.dataset.page = String(pageIndex + 1);
        const prevHidden = pageIndex === 0;
        const nextHidden = pageIndex === heroSlides.length - 1;
        pagerPrev.classList.toggle('is-hidden', prevHidden);
        pagerNext.classList.toggle('is-hidden', nextHidden);
        pagerPrev.setAttribute('aria-hidden', String(prevHidden));
        pagerNext.setAttribute('aria-hidden', String(nextHidden));
        pagerPrev.tabIndex = prevHidden ? -1 : 0;
        pagerNext.tabIndex = nextHidden ? -1 : 0;
                const keys = pagerLabelKeys[pageIndex] || pagerLabelKeys[0];
        const labels = { prev: keys.prev ? ui(keys.prev) : '', next: keys.next ? ui(keys.next) : '' };
        const previousPage = ui('previousPage');
        const nextPage = ui('nextPage');
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

            initScrollReveals();
      DragonI18n.subscribe(next => applyLanguage(next));
      DragonI18n.ready.then(() => applyLanguage(DragonI18n.current, false));
      loadUpdates();
      motionPreference.addEventListener('change', event => {
        reduceMotion = event.matches;
        if (reduceMotion) {
          scrollRevealObserver?.disconnect();
          document.querySelectorAll('[data-scroll-reveal]').forEach(element => element.classList.add('is-visible'));
        }
      });
      document.addEventListener('pointerdown', beginSwipe, { passive:true });
      document.addEventListener('pointermove', moveSwipe, { passive:false });
      document.addEventListener('pointerup', finishSwipe, { passive:true });
      document.addEventListener('pointercancel', cancelSwipe, { passive:true });
      document.addEventListener('pointerdown', () => { suppressClickUntil = 0; }, { passive:true, capture:true });
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
    })();
