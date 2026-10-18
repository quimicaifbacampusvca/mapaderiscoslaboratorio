import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ruler from '../js/metric-ruler.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const map = fs.readFileSync(path.join(root,'js/mapa.js'),'utf8');
assert.ok(html.indexOf('js/metric-ruler.js') < html.indexOf('js/mapa.js'));
assert.match(html, /id="ruler"[^>]*aria-pressed="false"/);
assert.match(map,/MetricRuler\.render\(ctx/);
assert.match(map,/if \(state\.ruler && metricLevel\)/);
assert.match(map,/MetricRuler\.MAX_ZOOM/g);
assert.equal(Ruler.MIN_ZOOM,15);
assert.equal(Ruler.MAX_ZOOM,1200);
assert.deepEqual(Ruler.LEVELS.map(x=>x.meters),[1,.5,.2,.1,.05,.02,.01]);

const cases = [
 [15,1],[70,1],[120,.5],[230,.2],[420,.1],[650,.05],[930,.02],[1150,.01],[1200,.01]
];
for (const [zoom,expected] of cases) assert.equal(Ruler.chooseLevel(zoom).meters,expected,`zoom=${zoom}`);
assert.equal(Ruler.chooseLevel(1000,.01).meters,.01,'histerese: manter 1 cm até 9.3 px');
assert.equal(Ruler.chooseLevel(850,.01).meters,.02,'histerese: reduzir quando necessário');
assert.equal(Ruler.chooseLevel(-1).meters,1);
assert.deepEqual(Ruler.visibleAxis(-100,100,12,400),{start:1,end:5});
assert.deepEqual(Ruler.visibleAxis(0,100,12,400),{start:0,end:4});
assert.equal(Ruler.visibleAxis(1000,100,12,400),null);

function fakeContext() {
 const strokes=[], texts=[]; let commands=0;
 const ctx = new Proxy({
   beginPath(){}, rect(){}, clip(){}, save(){}, restore(){}, fillRect(){}, moveTo(x,y){commands++; assert.ok(Number.isFinite(x)&&Number.isFinite(y));}, lineTo(x,y){commands++; assert.ok(Number.isFinite(x)&&Number.isFinite(y));}, stroke(){strokes.push(true);}, fill(){}, roundRect(){}, fillText(v){texts.push(v)},measureText(v){return {width:v.length*7}}
 },{get(t,p){return t[p]},set(t,p,v){t[p]=v;return true}});
 return {ctx,strokes,texts,getCommands:()=>commands};
}
const fake=fakeContext();
const level=Ruler.render(fake.ctx,{width:390,height:720,roomWidth:12,roomHeight:8,zoom:1200,originX:-5800,originY:-2500,previousStep:1});
assert.equal(level.meters,.01);
assert.ok(fake.getCommands()<1200,`Desenho fora do viewport? ${fake.getCommands()}`);
Ruler.renderSummary(fake.ctx,{width:390,roomWidth:12,roomHeight:8,level});
assert.ok(fake.texts.some(t=>t.includes('12,00 × 8,00 m')));
assert.ok(fake.texts.some(t=>t.includes('1 cm')));
const outside=fakeContext();
assert.equal(Ruler.render(outside.ctx,{width:390,height:720,roomWidth:12,roomHeight:8,zoom:1200,originX:4000,originY:4000}).meters,.01);
assert.equal(outside.getCommands(),0);
console.log('UIUX-0.3.0 — Metric ruler unit tests: OK');
