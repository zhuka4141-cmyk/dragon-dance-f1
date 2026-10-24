/* Aggregate counts only; database permissions enforce the administrator identity. */
(() => {
  const panel = document.getElementById('siteAnalytics');
  const refresh = document.getElementById('analyticsRefresh');
  const status = document.getElementById('analyticsStatus');
  const period = document.getElementById('analyticsPeriod');
  const metrics = {
    total_visitors:document.getElementById('totalVisitors'),
    total_views:document.getElementById('totalViews'),
    today_visitors:document.getElementById('todayVisitors'),
    today_views:document.getElementById('todayViews')
  };
  const numbers = new Intl.NumberFormat('zh-HK');
  const dates = new Intl.DateTimeFormat('zh-HK', {timeZone:'Asia/Hong_Kong', year:'numeric', month:'long', day:'numeric'});
  let client = null;
  let userId = null;
  let interval = null;
  let controller = null;
  let generation = 0;

  function clearMetrics() {
    Object.values(metrics).forEach(element => { element.textContent = '—'; });
  }

  async function load() {
    if (!client || controller) return;
    const requestGeneration = generation;
    controller = new AbortController();
    const activeController = controller;
    refresh.disabled = true;
    panel.setAttribute('aria-busy', 'true');
    status.className = 'status';
    status.textContent = '正在更新訪問統計…';
    const timeout = setTimeout(() => activeController.abort(), 10000);
    try {
      const {data, error} = await client.rpc('get_site_analytics').abortSignal(activeController.signal);
      if (requestGeneration !== generation) return;
      if (error) throw error;
      if (!data || !Object.keys(metrics).every(key => Number.isSafeInteger(data[key]) && data[key] >= 0) ||
          !Number.isFinite(Date.parse(data.started_at)) || !Number.isFinite(Date.parse(data.generated_at))) {
        throw new Error('Invalid analytics response');
      }
      Object.entries(metrics).forEach(([key, element]) => { element.textContent = numbers.format(data[key]); });
      period.textContent = `自 ${dates.format(new Date(data.started_at))} 起累計 · 今日以香港時間計算`;
      const updated = new Intl.DateTimeFormat('zh-HK', {timeZone:'Asia/Hong_Kong', hour:'2-digit', minute:'2-digit'}).format(new Date(data.generated_at));
      status.textContent = data.total_views === 0
        ? '尚未錄得訪問。分享網站後，這裡會自動累計。'
        : `更新於 ${updated}（香港時間）· 每分鐘自動更新`;
    } catch (error) {
      if (requestGeneration !== generation) return;
      clearMetrics();
      period.textContent = '網站公開頁面的訪問統計';
      status.className = 'status error';
      status.textContent = ['PGRST202', '42883', '42P01'].includes(error?.code)
        ? '訪問統計尚未啟用，請先在 Supabase 執行訪問統計的資料庫設定，再按「更新統計」。'
        : '暫時無法讀取統計。請檢查網絡及管理員登入狀態，再按「更新統計」重試。';
    } finally {
      clearTimeout(timeout);
      if (requestGeneration === generation) {
        controller = null;
        refresh.disabled = false;
        panel.setAttribute('aria-busy', 'false');
      }
    }
  }

  window.DragonAnalyticsAdmin = {
    setSession(nextClient, user) {
      const nextId = user?.id || null;
      if (nextId === userId) return;
      generation += 1;
      controller?.abort();
      controller = null;
      clearInterval(interval);
      interval = null;
      client = nextId ? nextClient : null;
      userId = nextId;
      clearMetrics();
      refresh.disabled = false;
      panel.setAttribute('aria-busy', 'false');
      period.textContent = '網站公開頁面的訪問統計';
      status.textContent = '';
      if (!client) return;
      void load();
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') void load();
      }, 60000);
    }
  };
  refresh.addEventListener('click', () => { void load(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void load();
  });
})();
