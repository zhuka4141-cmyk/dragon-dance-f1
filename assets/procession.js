/* Progressive decoration: navigation never depends on a working canvas. */
(() => {
  const hero = document.querySelector('.hero');
  const pages = document.getElementById('heroPages');
  if (!hero || !pages) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const scenes = [...document.querySelectorAll('.procession-scene')].map(scene => {
    const canvas = scene.querySelector('canvas');
    return {scene, canvas, context: canvas.getContext('2d'), width: 0, height: 0};
  });
  const curves = [
    [[100,880],[510,940],[920,865],[820,700]],
    [[820,700],[770,605],[365,630],[370,500]],
    [[370,500],[355,365],[710,315],[760,205]]
  ];
  const route = Array.from({length: 600}, (_, i) => {
    const t = i / 600 * 3, segment = Math.floor(t), u = t - segment;
    return [0,1].map(axis => (1-u)**3*curves[segment][0][axis] +
      3*(1-u)**2*u*curves[segment][1][axis] +
      3*(1-u)*u*u*curves[segment][2][axis] + u**3*curves[segment][3][axis]);
  });
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const light = sprite.getContext('2d');
  if (!light) return;
  const glow = light.createRadialGradient(16,16,0,16,16,16);
  glow.addColorStop(0, '#fff5d8');
  glow.addColorStop(.12, '#ffd38b');
  glow.addColorStop(.3, '#ed802a99');
  glow.addColorStop(1, '#ed802a00');
  light.fillStyle = glow;
  light.fillRect(0,0,32,32);
  let frame = 0, lastDraw = 0, visible = false;
  function activeScene() {
    const index = Number(pages.dataset.page || 1) - 1;
    return index < 2 ? scenes[index] : null;
  }
  function canAnimate() {
    return visible && !document.hidden && !reduced.matches && activeScene()?.context;
  }
  function draw(now) {
    frame = 0;
    if (!canAnimate()) return;
    if (now - lastDraw >= 1000 / 30) {
      lastDraw = now;
      const {context, width, height} = activeScene();
      const scale = Math.min(width / 1100, height / 950);
      const left = (width - 1100 * scale) / 2, top = (height - 950 * scale) / 2;
      context.clearRect(0,0,width,height);
      for (let i = 0; i < 80; i++) {
        const [x,y] = route[Math.floor((i * 7.5 + now / 110) % route.length)];
        const offset = Math.sin(i * 17.3) * 22;
        const size = (10 + 8 * (1 + Math.sin(now / 900 + i))) * scale;
        context.globalAlpha = .3 + .6 * (1 + Math.sin(now / 710 + i * 2.7)) / 2;
        context.drawImage(sprite,left+(x+offset)*scale-size/2,top+y*scale-size/2,size,size);
      }
      context.globalAlpha = 1;
    }
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    if (!canAnimate()) {
      cancelAnimationFrame(frame);
      frame = 0;
      scenes.forEach(({scene,context,width,height}) => {
        context?.clearRect(0,0,width,height);
        scene.style.removeProperty('--drift-x');
        scene.style.removeProperty('--drift-y');
      });
    } else if (!frame) frame = requestAnimationFrame(draw);
  }
  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    scenes.forEach(item => {
      item.width = item.scene.clientWidth;
      item.height = item.scene.clientHeight;
      item.canvas.width = Math.round(item.width * ratio);
      item.canvas.height = Math.round(item.height * ratio);
      item.context?.setTransform(ratio,0,0,ratio,0,0);
    });
    sync();
  }
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(hero);
  new MutationObserver(sync).observe(pages, {attributes:true, attributeFilter:['data-page']});
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  hero.addEventListener('pointermove', event => {
    if (!canAnimate() || !finePointer.matches) return;
    const box = hero.getBoundingClientRect(), scene = activeScene().scene;
    scene.style.setProperty('--drift-x', `${((event.clientX-box.left)/box.width-.5)*12}px`);
    scene.style.setProperty('--drift-y', `${((event.clientY-box.top)/box.height-.5)*8}px`);
  }, {passive:true});
  hero.addEventListener('pointerleave', () => scenes.forEach(({scene}) => {
    scene.style.removeProperty('--drift-x');
    scene.style.removeProperty('--drift-y');
  }));
  resize();
})();
