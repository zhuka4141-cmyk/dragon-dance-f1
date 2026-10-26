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
  const PUSH_DISTANCE = 70;
  const PUFF_COUNT = window.innerWidth < 760 ? 22 : 46;
  let width = 0;
  let height = 0;
  let pointer = { x: -9999, y: -9999 };
  let smooth = { x: -9999, y: -9999 };
  let frame = 0;
  let last = 0;
  let puffs = [];

  const clamp01 = value => Math.max(0, Math.min(1, value));

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
      y: initial ? Math.random() * height : height + size / 2 + 20,
      ox: 0,
      oy: 0,
      vy: -(8 + Math.random() * 14),
      size,
      alpha: 0.25 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      sway: 18 + Math.random() * 30,
      age: initial ? 1 : 0
    };
  }

  function draw(dt) {
    ctx.clearRect(0, 0, width, height);
    const ease = 1 - Math.exp(-dt * 3);
    const follow = 1 - Math.exp(-dt * 12);
    smooth.x += (pointer.x - smooth.x) * follow;
    smooth.y += (pointer.y - smooth.y) * follow;

    for (const p of puffs) {
      p.phase += dt * 0.6;
      p.age = Math.min(1, p.age + dt / 1.2);
      p.x += Math.sin(p.phase) * p.sway * dt;
      p.y += p.vy * dt;

      // Ease toward a push target that grows as the pointer gets closer, then relax back.
      let tx = 0;
      let ty = 0;
      if (fine.matches) {
        const dx = p.x - smooth.x;
        const dy = p.y - smooth.y;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = AVOID_RADIUS + p.size * 0.3;
        if (dist < reach) {
          const push = (1 - dist / reach) ** 2 * PUSH_DISTANCE;
          tx = (dx / dist) * push;
          ty = (dy / dist) * push * 0.6;
        }
      }
      p.ox += (tx - p.ox) * ease;
      p.oy += (ty - p.oy) * ease;

      // Fade in after spawning and out before leaving the top, so nothing pops.
      const fade = p.age * clamp01((p.y + p.size / 2) / p.size);
      if (p.y + p.size / 2 < 0) Object.assign(p, spawn(false));

      ctx.globalAlpha = p.alpha * fade;
      ctx.drawImage(sprite, p.x + p.ox - p.size / 2, p.y + p.oy - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function resize() {
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    // Mobile toolbars change the height by a few dozen pixels while scrolling; ignore those.
    if (width && nextWidth === width && Math.abs(nextHeight - height) < 160) return;
    const scaleX = width ? nextWidth / width : 1;
    const scaleY = height ? nextHeight / height : 1;
    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.round(width * DPR);
    canvas.height = Math.round(height * DPR);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (puffs.length) {
      for (const p of puffs) { p.x *= scaleX; p.y *= scaleY; }
      draw(0);
    } else {
      puffs = Array.from({ length: PUFF_COUNT }, () => spawn(true));
    }
  }

  function step(time) {
    frame = requestAnimationFrame(step);
    const dt = Math.min((time - last) / 1000 || 0.016, 0.05);
    last = time;
    draw(dt);
  }

  function onPointer(event) {
    if (pointer.x < -9000) { smooth.x = event.clientX; smooth.y = event.clientY; }
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
