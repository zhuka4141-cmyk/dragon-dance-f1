/* Shared public feed states. Media metadata remains owned by each page. */
(() => {
  let sdkRequest = null;
  function loadSdk() {
    if (window.supabase?.createClient) return Promise.resolve(window.supabase);
    if (sdkRequest) return sdkRequest;
    sdkRequest = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => finish(new Error('Updates service unavailable')), 8000);
      function finish(error) {
        clearTimeout(timer);
        script.onload = script.onerror = null;
        if (error) {
          script.remove();
          sdkRequest = null;
          reject(error);
        } else resolve(window.supabase);
      }
      script.async = true;
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = () => finish(window.supabase?.createClient ? null : new Error('Updates service unavailable'));
      script.onerror = () => finish(new Error('Updates service unavailable'));
      document.head.append(script);
    });
    return sdkRequest;
  }

  async function load(limit) {
    const config = window.DRAGON_DANCE_SUPABASE;
    if (!config?.url || !config?.publishableKey) {
      throw new Error('Updates service unavailable');
    }
    const sdk = await loadSdk();
    const client = sdk.createClient(config.url, config.publishableKey, {
      auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false }
    });
    const controller = new AbortController();
    let timer;
    try {
      let query = client.from('updates')
        .select('slug,published_at,title_en,title_zh,body_en,body_zh,cover_url,image_urls,is_pinned,sort_order')
        .eq('is_published', true)
        .order('is_pinned', {ascending:false})
        .order('sort_order', {ascending:true, nullsFirst:false})
        .order('published_at', {ascending:false});
      if (limit) query = query.limit(limit);
      const {data, error} = await Promise.race([
        query.abortSignal(controller.signal),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(new Error('Updates request timed out'));
          }, 12000);
        })
      ]);
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('Invalid updates response');
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  const ui = (key, vars) => window.DragonI18n.ui(key, vars);

  function renderStatus(container, state, language, retry) {
    container.dataset.state = state;
    container.setAttribute('aria-busy', String(state === 'loading'));
    if (state === 'ready') return false;
    const messages = {
        loading: ui('feedLoading'),
        empty: ui('feedEmpty'),
        error: ui('feedError')
      };
    const status = document.createElement('div');
    status.className = 'updates-status updates-preview-status';
    const text = document.createElement('p');
    text.textContent = messages[state];
    status.append(text);
    if (state === 'error') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'updates-retry';
      button.textContent = ui('feedRetry');
      button.addEventListener('click', () => {
        container.tabIndex = -1;
        container.focus({preventScroll:true});
        retry();
      });
      status.append(button);
    }
    container.append(status);
    return true;
  }

  function protectMedia(media, language) {
    media.addEventListener('error', () => {
      media.hidden = true;
      const fallback = document.createElement('span');
      fallback.className = 'media-unavailable';
      fallback.textContent = ui('mediaUnavailable');
      media.parentElement?.append(fallback);
    }, {once:true});
  }

  window.DragonUpdates = {load, renderStatus, protectMedia};
})();
