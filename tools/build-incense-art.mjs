import {writeFileSync} from 'node:fs';
// Original mathematical linework: a ceremonial dragon traced by incense.
const segments = [
  [[100,880],[510,940],[920,865],[820,700]],
  [[820,700],[770,605],[365,630],[370,500]],
  [[370,500],[355,365],[710,315],[760,205]]
];
function point(t) {
  const part = Math.min(2, Math.floor(t * 3));
  const u = t * 3 - part;
  const p = segments[part];
  return [0,1].map(axis => (1-u)**3*p[0][axis]+3*(1-u)**2*u*p[1][axis]+3*(1-u)*u*u*p[2][axis]+u**3*p[3][axis]);
}
let seed=716;
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const fixed=n=>n.toFixed(2);
const lines=[]; const lights=[];
const line=(x,y,a,b,color,width=.6)=>`<path d="M${fixed(x)} ${fixed(y)}L${fixed(a)} ${fixed(b)}" stroke="${color}" stroke-width="${width}"/>`;
const dot=(x,y,r,color)=>`<circle cx="${fixed(x)}" cy="${fixed(y)}" r="${r}" fill="${color}"/>`;
for(let strand=0;strand<20;strand++){
  const coords=[];
  for(let i=0;i<=240;i++){
    const t=i/240;const p=point(t);const q=point(Math.min(1,t+.001));
    const dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy)||1;
    const radius=(9+26*Math.sin(t*Math.PI*.68))*Math.min(1,t*8+.15);
    const offset=Math.sin(strand/20*Math.PI*2+t*39)*radius;
    coords.push(`${i?'L':'M'}${fixed(p[0]-dy/length*offset)} ${fixed(p[1]+dx/length*offset)}`);
  }
  lines.push(`<path d="${coords.join('')}" stroke="${strand%3?'#8b4f24':'#e29c4c'}" stroke-opacity="${strand%3?.46:.65}" stroke-width=".7"/>`);
}
for(let i=0;i<190;i++){
  const t=(i+.4)/190,p=point(t),q=point(Math.min(1,t+.001));
  const dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy)||1;
  const nx=-dy/length,ny=dx/length,tx=dx/length,ty=dy/length;
  const radius=(9+26*Math.sin(t*Math.PI*.68))*Math.min(1,t*8+.15);
  for(let j=0;j<6;j++){
    const side=j%2?1:-1; const start=(random()*.7+.25)*radius*side;
    const reach=start+side*(12+random()*36)*(t*.7+.3);
    const lean=(random()-.3)*30;
    const x=p[0]+nx*reach+tx*lean,y=p[1]+ny*reach+ty*lean;
    lines.push(line(p[0]+nx*start,p[1]+ny*start,x,y,j%3?'#a26335':'#f3ad62',.55));
    lights.push(dot(x,y,fixed(.6+random()*1.2),j%4?'#ffc47a':'#fff3c8'));
  }
}
const head = [[738,225],[742,183],[760,149],[779,112],[806,127],[839,112],[868,130],[917,136],[951,169],[917,191],[886,181],[881,216],[846,205],[806,232],[738,225]];
lines.push(`<path d="M${head.map(p=>p.join(' ')).join('L')}" fill="#24110c" stroke="#c58343" stroke-width="2"/>`);
for(let k=1;k<head.length;k++){
  const a=head[k-1],b=head[k];
  for(let j=0;j<18;j++){const t=j/18,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
    const angle=Math.atan2(y-174,x-824)+(random()-.5)*.8,r=11+random()*22;
    const ex=x+Math.cos(angle)*r,ey=y+Math.sin(angle)*r;
    lines.push(line(x,y,ex,ey,'#de9b52',.7));lights.push(dot(ex,ey,'1.3','#ffe1a0'));
  }
}
lines.push('<g stroke="#f1b365" stroke-linecap="round" stroke-linejoin="round"><path d="M784 126L784 82L753 58M835 122L850 74L889 42" stroke-width="4"/><path d="M787 169Q817 138 847 153L835 177L806 184ZM866 153L912 160L927 171L887 170M886 184L850 188L854 204L876 209" stroke-width="2"/><path d="M872 203C945 233 819 270 854 312M903 164C966 159 1004 183 1032 158M838 202C817 260 775 258 796 288" stroke-width="1.2"/></g>');
lights.push(dot(820,166,'4','#fff5c9'));
for(let i=0;i<75;i++){const a=i/75*Math.PI*2,r=32+random()*23;const x=1008+Math.cos(a)*r,y=67+Math.sin(a)*r;lines.push(line(1008+Math.cos(a)*14,67+Math.sin(a)*14,x,y,'#e1a55e',.7));lights.push(dot(x,y,'1.6','#ffe8ad'));}
lights.push(dot(1008,67,'9','#fff4d0'));
for(let i=0;i<90;i++){const t=random(),p=point(t);lights.push(dot(p[0]+(random()-.5)*200,p[1]-35-random()*140,fixed(.4+random()),'#b46b34'));}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 950" fill="none" role="img" aria-labelledby="title desc"><title id="title">A dragon written in incense light</title><desc id="desc">Original geometric artwork of a woven ceremonial dragon following a radiant pearl. Fine sticks and glowing incense tips follow its winding body; an artistic interpretation, not a documentary image.</desc><defs><filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter></defs><g>${lines.join('')}</g><g opacity=".8" filter="url(#glow)">${lights.join('')}</g><g>${lights.join('')}</g></svg>`;
writeFileSync(new URL('../assets/incense-dragon.svg',import.meta.url),svg);
console.log(`Original incense geometry: ${lines.length} strokes, ${lights.length} lights; ${Math.round(Buffer.byteLength(svg)/1024)}KB before compression.`);
