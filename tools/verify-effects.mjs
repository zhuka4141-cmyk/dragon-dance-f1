import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/smoke.js', import.meta.url), 'utf8');

// The incense smoke layer replaced the old fog canvas in home.js. It is an IIFE with no
// exports, so the contract is observed from the DOM it mounts and the frames it schedules.
function harness({reducedMotion = false, hasRaf = true, width = 1280, height = 800, dpr = 2} = {}) {
  const pending = new Set();
  const frames = [];
  const prepended = [];
  const listeners = new Map();
  let sequence = 0;

  const makeContext = () => ({
    fillStyle: '', globalAlpha: 1,
    createRadialGradient: () => ({addColorStop() {}}),
    fillRect() {}, setTransform() {}, clearRect() {}, drawImage() {}
  });

  const document = {
    hidden: false,
    body: {prepend: node => prepended.push(node)},
    createElement(tag) {
      return {
        tagName: tag, className: '', width: 0, height: 0, style: {},
        setAttribute(name, value) { this[name] = value; },
        getContext: () => makeContext()
      };
    },
    addEventListener(type, handler) { listeners.set(type, handler); }
  };

  const window = {
    innerWidth: width,
    innerHeight: height,
    devicePixelRatio: dpr,
    matchMedia: query => ({matches: query.includes('reduce') ? reducedMotion : true}),
    addEventListener(type, handler) { listeners.set(type, handler); }
  };

  if (hasRaf) {
    window.requestAnimationFrame = fn => {
      const id = ++sequence;
      pending.add(id);
      frames.push(fn);
      return id;
    };
    window.cancelAnimationFrame = id => pending.delete(id);
  }

  const scope = vm.createContext({
    window,
    document,
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    performance: {now: () => 0}
  });

  return {scope, pending, frames, prepended, listeners, document, window};
}

// Reduced motion: the layer must not mount or animate at all.
const still = harness({reducedMotion: true});
vm.runInContext(source, still.scope);
assert.equal(still.prepended.length, 0, 'Reduced motion never mounts the smoke canvas');
assert.equal(still.pending.size, 0, 'Reduced motion never starts the animation loop');

// No requestAnimationFrame: same early exit, no crash.
const noRaf = harness({hasRaf: false});
assert.doesNotThrow(() => vm.runInContext(source, noRaf.scope), 'Missing requestAnimationFrame is tolerated');
assert.equal(noRaf.prepended.length, 0, 'No requestAnimationFrame means no canvas');

// Motion allowed: exactly one canvas, decorative, behind the content.
const live = harness();
vm.runInContext(source, live.scope);
assert.equal(live.prepended.length, 1, 'Motion mounts exactly one smoke canvas');

const canvas = live.prepended[0];
assert.equal(canvas.className, 'smoke-canvas', 'The canvas carries its styling hook');
assert.equal(canvas['aria-hidden'], 'true', 'The canvas stays out of the accessibility tree');
assert.equal(canvas.width, Math.round(1280 * 1.5), 'Canvas width follows the clamped device pixel ratio');
assert.equal(canvas.height, Math.round(800 * 1.5), 'Canvas height follows the clamped device pixel ratio');
assert.equal(canvas.style.width, '1280px', 'Canvas CSS width matches the viewport');
assert.equal(canvas.style.height, '800px', 'Canvas CSS height matches the viewport');

// One loop, and each frame schedules exactly one successor.
assert.equal(live.pending.size, 1, 'Motion starts a single animation loop');
const [firstId] = live.pending;
live.pending.delete(firstId);
live.frames[0](16);
assert.equal(live.pending.size, 1, 'Each frame schedules the next one, never more');

// Background tab: stop drawing, then resume without stacking loops.
const onVisibility = live.listeners.get('visibilitychange');
assert.equal(typeof onVisibility, 'function', 'Visibility changes are observed');
live.document.hidden = true;
onVisibility();
assert.equal(live.pending.size, 0, 'A hidden tab cancels the loop');
onVisibility();
assert.equal(live.pending.size, 0, 'Staying hidden keeps the loop cancelled');
live.document.hidden = false;
onVisibility();
assert.equal(live.pending.size, 1, 'Returning to the tab restarts exactly one loop');
onVisibility();
assert.equal(live.pending.size, 1, 'Repeated visibility events never stack loops');

// Resize and pointer tracking stay wired.
assert.equal(typeof live.listeners.get('resize'), 'function', 'Resize keeps the canvas in sync');
assert.equal(typeof live.listeners.get('pointermove'), 'function', 'Pointer tracking is wired');

// A resize re-fits the canvas to the new viewport.
live.window.innerWidth = 760;
live.window.innerHeight = 400;
live.listeners.get('resize')();
assert.equal(canvas.style.width, '760px', 'Resize refits the canvas width');
assert.equal(canvas.style.height, '400px', 'Resize refits the canvas height');

console.log('PASS: smoke layer mounts one decorative canvas, respects reduced motion and missing rAF, clamps DPR, sizes to the viewport, reschedules one frame per tick, and stops/restarts on tab visibility.');
