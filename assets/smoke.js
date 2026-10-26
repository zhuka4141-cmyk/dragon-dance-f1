/* Full-page incense smoke: drifts upward behind the content and parts around the pointer.
   Skipped for reduced motion. Pointer avoidance only runs on fine pointers, so touch screens keep the drift without tracking. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches || !window.requestAnimationFrame) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const canvas = document.createElement('canvas');
  canvas.className = 'smoke-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const AVOID_RADIUS = 150;
  const PUFF_COUNT = window.innerWidth < 760 ? 22 : 46;
  let width = 0;
  let height = 0;
  let pointer = { x: -9999, y: -9999 };
  let frame = 0;
  let last = 0;
  let puffs = [];

  // Pre-render one soft puff so each frame only draws images, not gradients.
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 128;
  const sctx = sprite.getContext('2d');
  const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(235, 232, 226, 0.5)');
  grad.addColorStop(0.45, 'rgba(200, 196, 192, 0.18)');
  grad.addColorStop(1, 'rgba(200, 196, 192, 0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 128, 128);

  function spawn(initial) {
    const size = 90 + Math.random() * 150;
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + size,
      vx: 0,
      vy: -(8 + Math.random() * 14),
      size,
      alpha: 0.25 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      sway: 18 + Math.random() * 30
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * DPR);
    canvas.height = Math.round(height * DPR);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    puffs = Array.from({ length: PUFF_COUNT }, () => spawn(true));
  }

  function step(time) {
    frame = requestAnimationFrame(step);
    const dt = Math.min((time - last) / 1000 || 0.016, 0.05);
    last = time;
    ctx.clearRect(0, 0, width, height);

    for (const p of puffs) {
      p.phase += dt * 0.6;
      // Gentle sideways sway plus upward drift.
      let targetX = p.x + Math.sin(p.phase) * p.sway * dt;
      p.y += p.vy * dt;

      // Push the smoke away from the cursor with a soft falloff.
      if (fine.matches) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = AVOID_RADIUS + p.size * 0.3;
        if (dist < reach) {
          const force = (1 - dist / reach) * 140 * dt;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force * 0.4;
        }
      }
      p.vx *= 0.94;
      p.vy += (-(8 + p.size * 0.02) - p.vy) * 0.02;
      targetX += p.vx * dt * 60;
      p.x = targetX;

      if (p.y + p.size < -40) Object.assign(p, spawn(false));

      ctx.globalAlpha = p.alpha;
      ctx.drawImage(sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function onPointer(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!frame) {
      last = performance.now();
      frame = requestAnimationFrame(step);
    }
  });
  frame = requestAnimationFrame(step);
})();
