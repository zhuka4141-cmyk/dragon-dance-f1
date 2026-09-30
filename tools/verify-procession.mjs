import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/procession.js', import.meta.url), 'utf8');
function fixture(missingCanvas = false) {
  const frames = new Map(), events = {}, observers = {};
  let sequence = 0, draws = [0,0];
  const reduced = {matches:false, addEventListener:(_, fn) => events.motion = fn};
  const pages = {dataset:{page:'1'}};
  const scene = index => ({clientWidth:600, clientHeight:500,
    style:{removeProperty(){},setProperty(){}},
    querySelector:() => ({getContext:() => missingCanvas ? null : {
      clearRect(){},setTransform(){},drawImage(){draws[index]++;}
    }})});
  const scenes = [scene(0),scene(1)];
  const hero = {addEventListener(){}};
  const document = {hidden:false,
    querySelector:() => hero, getElementById:() => pages,
    querySelectorAll:() => scenes, addEventListener:(name, fn) => events[name] = fn,
    createElement:() => ({getContext:() => ({createRadialGradient:() => ({addColorStop(){}}),fillRect(){}})})
  };
  const scope = {document,devicePixelRatio:2,
    matchMedia:query => query.includes('reduced') ? reduced : {matches:true},
    requestAnimationFrame:fn => {frames.set(++sequence,fn); return sequence;},
    cancelAnimationFrame:id => frames.delete(id),
    ResizeObserver:class {constructor(fn){observers.resize=fn;} observe(){}},
    IntersectionObserver:class {constructor(fn){observers.visibility=fn;} observe(){}},
    MutationObserver:class {constructor(fn){observers.page=fn;} observe(){}}
  };
  vm.runInNewContext(source,scope);
  return {frames,events,observers,pages,reduced,document,draws,
    tick(now){const [id,fn]=frames.entries().next().value;frames.delete(id);fn(now);}};
}
const f = fixture();
assert.equal(f.frames.size,0,'Offscreen startup remains idle');
f.observers.visibility([{isIntersecting:true}]);
f.observers.resize();
assert.equal(f.frames.size,1,'Repeated state changes maintain one loop');
f.tick(100);
assert.equal(f.draws[0],80,'Only Home is drawn');
f.tick(110);
assert.equal(f.draws[0],80,'Frame work is capped at 30fps');
f.pages.dataset.page='2'; f.observers.page(); f.tick(200);
assert.equal(f.draws[1],80,'Heritage gets the single active canvas');
f.pages.dataset.page='3'; f.observers.page();
assert.equal(f.frames.size,0,'Crew has no canvas loop');
f.pages.dataset.page='1'; f.observers.page();
f.document.hidden=true; f.events.visibilitychange();
assert.equal(f.frames.size,0,'Hidden tab cancels frames');
f.document.hidden=false; f.events.visibilitychange();
f.reduced.matches=true; f.events.motion();
assert.equal(f.frames.size,0,'Reduced motion cancels frames');
f.reduced.matches=false; f.events.motion();
f.observers.visibility([{isIntersecting:false}]);
assert.equal(f.frames.size,0,'Scrolling past hero stops rendering');
const unavailable=fixture(true);
assert.doesNotThrow(()=>unavailable.observers.visibility([{isIntersecting:true}]));
assert.equal(unavailable.frames.size,0,'Unavailable canvas retains static SVG without a loop');
console.log('PASS: procession single-loop scheduling, 30fps cap, active page, offscreen, hidden tab, reduced motion and canvas fallback.');
