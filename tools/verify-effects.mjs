import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/home.js', import.meta.url), 'utf8');
const pending = new Set();
let sequence = 0;
let paints = 0;
const scope = vm.createContext({
  context:{clearRect:() => paints++}, width:100, height:100, visible:true,
  pageIndex:0, document:{hidden:false}, reduceMotion:false, frame:0,
  clearPoints:[], wisps:[], lastDraw:0, canvas:{hidden:false},
  hero:{classList:{toggle(){}}}, clearFog(){}, drawWisp(){},
  requestAnimationFrame:() => { pending.add(++sequence); return sequence; },
  cancelAnimationFrame:id => pending.delete(id)
});
vm.runInContext(source.slice(source.indexOf('      function fogCanAnimate()'), source.indexOf('      function disperseFog(')), scope);
scope.updateFogState();
assert.equal(pending.size, 1, 'Visible Home schedules one frame');
scope.updateFogState();
assert.equal(pending.size, 1, 'Repeated updates never create duplicate loops');
scope.reduceMotion = true;
scope.updateFogState();
assert.equal(pending.size, 0, 'Reduced motion stops the loop');
assert.equal(paints, 1, 'Reduced motion retains one static fog frame');
scope.reduceMotion = false;
scope.visible = false;
scope.updateFogState();
assert.equal(pending.size, 0, 'Offscreen hero does no drawing work');
scope.visible = true;
scope.pageIndex = 1;
scope.updateFogState();
assert.equal(pending.size, 0, 'Other horizontal pages stop Home effects');
assert.equal(scope.canvas.hidden, true);
scope.pageIndex = 0;
scope.document.hidden = true;
scope.updateFogState();
assert.equal(pending.size, 0, 'Hidden document stops rendering');
scope.document.hidden = false;
scope.updateFogState();
assert.equal(pending.size, 1, 'Returning to Home resumes rendering');
scope.context = null;
assert.doesNotThrow(() => scope.updateFogState(), 'Missing canvas does not break navigation');
assert.equal(pending.size, 0);
console.log('PASS: fog visibility, reduced motion, hidden tabs, null canvas, restart and single-loop scheduling.');
