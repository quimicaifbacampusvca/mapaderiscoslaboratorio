import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const lib=require('../js/lab-glyphs.js');
const html=read('index.html'),map=read('js/mapa.js'),sw=read('sw.js');
assert.equal(lib.types.length,6);
assert.ok(html.indexOf('js/lab-glyphs.js')>html.indexOf('js/architectural-glyphs.js'));
assert.ok(html.indexOf('js/lab-glyphs.js')<html.indexOf('js/mapa.js'));
assert.ok(sw.includes('./js/lab-glyphs.js'));
for(const type of lib.types){
 assert.ok(map.includes(`LabGlyphs.draw(ctx, "${type}", w, h)`));
 assert.ok(map.includes(`LabGlyphs.svg("${type}", w, h)`));
 const filename={bench:'lab-bench.svg',benchL:'lab-benchL.svg',sink:'lab-sink.svg',hood:'lab-hood.svg',extinguisher:'equipment-extinguisher.svg',chemical:'risk-chemical.svg'}[type];
 assert.ok(html.includes(`data-type="${type}"`));
 assert.ok(html.includes(`assets/svg/${filename}`));
 assert.ok(sw.includes(`./assets/svg/${filename}`));
 const staticSvg=read(`assets/svg/${filename}`);
 assert.match(staticSvg,/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
 for(const [w,h] of [[144,48],[100,100],[18,18],[12,12],[20,20],[1000,140]]){
  const plan=lib.plan(type,w,h),svg=lib.svg(type,w,h);
  assert.ok(plan.length>=2);
  assert.equal((svg.match(/<(rect|circle|path)\b/g)||[]).length,plan.length);
  assert.match(svg,/stroke="#[0-9A-Fa-f]{6}"/);
  assert.doesNotMatch(svg,/<script|foreignObject|onload=/i);
  const commands=[];const ctx=new Proxy({},{
    get(o,k){if(k in o)return o[k];return (...args)=>commands.push([k,...args]);},
    set(o,k,v){o[k]=v;return true;}
  });
  lib.draw(ctx,type,w,h);
  assert.equal(commands.filter(x=>x[0]==='beginPath').length,plan.length);
  for(const shape of plan){
   if(shape.kind==='rect'){
    assert.ok(shape.x>=-.01&&shape.y>=-.01);
    assert.ok(shape.x+shape.w<=w+.01&&shape.y+shape.h<=h+.01);
   }
   if(shape.kind==='circle'){
    assert.ok(shape.cx-shape.r>=-.01&&shape.cy-shape.r>=-.01);
    assert.ok(shape.cx+shape.r<=w+.01&&shape.cy+shape.r<=h+.01);
   }
  }
 }
}
assert.ok(!map.includes('if (w < 20) { ctx.fillStyle = "#ef4444"'));
assert.ok(map.includes('if (type === "chemical") return LabGlyphs.svg("chemical", w, h);'));
assert.ok(!/indexedDB|localStorage|crypto|fetch|URL\./.test(read('js/lab-glyphs.js')));
assert.match(read('manifest.webmanifest'),/mapaderiscoslaboratorio/);
console.log('UIUX-0.9.2 — 6 tipos no Canvas/SVG, escalas, miniaturas e PWA: OK');
