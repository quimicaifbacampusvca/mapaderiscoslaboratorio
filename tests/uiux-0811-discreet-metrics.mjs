import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import Ruler from '../js/metric-ruler.js';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const map=readFileSync(join(root,'js/mapa.js'),'utf8');
assert.match(map,/ctx\.strokeStyle = "#78858b18"; ctx\.lineWidth = 0\.8;/);
assert.deepEqual(Ruler.LEVELS.map(level=>level.meters),[1,.5,.2,.1,.05,.02,.01]);
assert.equal(Ruler.MAX_ZOOM,1200);

const fills=[];const painted=[];const strokes=[];const labels=[];const boxes=[];
let fillStyle='',strokeStyle='',font='';
const ctx={
  save(){},restore(){},beginPath(){},rect(){},clip(){},moveTo(){},lineTo(){},stroke(){strokes.push(strokeStyle)},fill(){painted.push(fillStyle)},
  fillRect(){fills.push(fillStyle)},roundRect(x,y,w,h){boxes.push([x,y,w,h])},
  fillText(label){labels.push(String(label))},measureText(t){return {width:t.length*6.5}},
  get fillStyle(){return fillStyle},set fillStyle(v){fillStyle=v},
  get strokeStyle(){return strokeStyle},set strokeStyle(v){strokeStyle=v},
  get font(){return font},set font(v){font=v}
};
const level=Ruler.render(ctx,{width:850,height:650,roomWidth:12,roomHeight:8,zoom:72,originX:20,originY:88});
assert.equal(level.label,'1 m');
assert.ok(fills.includes('rgba(233, 240, 244, 0.38)'));
assert.ok(fills.includes('rgba(225, 235, 240, 0.44)'));
assert.ok(strokes.includes('rgba(28, 77, 96, 0.075)'));
assert.ok(strokes.includes('rgba(48, 83, 101, .43)'));
assert.ok(labels.includes('1'));
const detail=Ruler.render(ctx,{width:850,height:650,roomWidth:12,roomHeight:8,zoom:1150,originX:-3500,originY:-2400});
assert.equal(detail.label,'1 cm');
Ruler.renderSummary(ctx,{width:850,height:650,roomWidth:12,roomHeight:8,level:detail});
assert.ok(labels.some(t=>t.includes('12,00 × 8,00 m')));
assert.ok(labels.some(t=>t.includes('1 cm')));
assert.ok(boxes.some(b=>b[3]===24),'Indicador compacto deve ter 24 px de altura');
assert.ok(painted.includes('rgba(13, 32, 43, .77)'));
console.log('UIUX-0.8.1.1 — graduação discreta: OK');
