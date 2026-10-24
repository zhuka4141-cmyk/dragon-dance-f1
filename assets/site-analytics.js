/* Anonymous first-party counts. Preview, admin and privacy opt-outs are excluded. */
(() => {
  if (window.dragonVisitRecorded || location.hostname !== 'lstc-dragon-dance.vercel.app') return;
  const page = {'/':'home', '/index.html':'home', '/updates.html':'updates'}[location.pathname];
  const config = window.DRAGON_DANCE_SUPABASE;
  if (!page || !config?.url || !config?.publishableKey || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  window.dragonVisitRecorded = true;
  let recorded = false;

  async function record() {
    if (recorded || document.visibilityState !== 'visible') return;
    recorded = true;
    document.removeEventListener?.('visibilitychange', record);
    try {
      const key = 'dragon-dance-visitor-v1';
      let visitor = localStorage.getItem(key);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitor || '')) {
        visitor = crypto.randomUUID();
        localStorage.setItem(key, visitor);
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        await fetch(`${config.url}/rest/v1/rpc/record_site_visit`, {
          method:'POST',
          headers:{apikey:config.publishableKey, 'Content-Type':'application/json'},
          body:JSON.stringify({p_event_id:crypto.randomUUID(), p_visitor_id:visitor, p_page:page}),
          credentials:'omit', referrerPolicy:'no-referrer', cache:'no-store', keepalive:true,
          signal:controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }
    } catch {
      // Storage, network and analytics failures must never interrupt the website.
    }
  }
  // A preloaded/background tab only counts when it is actually opened.
  if (document.visibilityState === 'visible') void record();
  else document.addEventListener('visibilitychange', record);
})();
