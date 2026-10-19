import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const gfx=require('../js/architectural-glyphs.js');
const source=readFileSync(resolve(root,'js/mapa.js'),'utf8');
const html=readFileSync(resolve(root,'index.html'),'utf8');
const sw=readFileSync(resolve(root,'sw.js'),'utf8');
assert.match(html,/src="js\/architectural-glyphs\.js"/);
assert.ok(html.indexOf('js/architectural-glyphs.js')<html.indexOf('js/mapa.js'));
assert.ok(sw.includes('./js/architectural-glyphs.js'));
assert.match(source,/function drawWall\(w, h\)\s*\{\s*ArchitecturalGlyphs\.drawWall\(ctx, w, h\);/);
assert.match(source,/function drawDoor\(o, w, h\)\s*\{\s*ArchitecturalGlyphs\.drawDoor\(ctx, getDoorArcData\(o, w, h\), w, h\);/);
assert.match(source,/svgDoor\(o,w,h,area\.dimensoes\)/);
assert.equal(source.includes('case "wall": return ArchitecturalGlyphs.svgWall(w, h);'),true);
assert.match(source,/const longestDoor = Math.max\(0,/);
assert.match(source,/const pad = longestDoor > 0/);
const records=[];
const fakeCtx=new Proxy({}, {get(target,prop){
 if(prop in target)return target[prop];
 if(prop==='canvas')return {};
 return (...args)=>{records.push([prop,...args])};
},set(target,prop,value){target[prop]=value;return true;}});
for (const [w,h] of [[240,12],[12,240],[10,3],[240,45]]) {
 records.length=0;
 gfx.drawWall(fakeCtx,w,h);
 assert.ok(records.some(row=>row[0]==='fillRect'&&row[3]===w&&row[4]===h),'Parede preenchida');
 assert.ok(records.some(row=>row[0]==='strokeRect'));
 const svg=gfx.svgWall(w,h);
 assert.match(svg,/#[0-9A-Fa-f]{6}/);
 assert.match(svg,/stroke-width="1\.5"/);
 assert.ok(!/<script|<foreignObject/i.test(svg));
 assert.ok(gfx.wallDetails(w,h).hatches.length<=160);
}
const arcs=[
 {centerX:0,centerY:12,radius:100,start:0,end:-Math.PI/2,anticlockwise:true},
 {centerX:0,centerY:0,radius:100,start:0,end:Math.PI/2,anticlockwise:false},
 {centerX:12,centerY:0,radius:100,start:Math.PI/2,end:Math.PI,anticlockwise:false},
 {centerX:0,centerY:0,radius:100,start:Math.PI/2,end:0,anticlockwise:true}
];
for(let i=0;i<4;i++){
 const [w,h]=i<2?[100,12]:[12,100];const a=arcs[i];
 records.length=0;gfx.drawDoor(fakeCtx,a,w,h);
 const svg=gfx.svgDoor(a,w,h);
 const p=gfx.doorPlan(a,w,h);
 assert.ok(svg.includes('stroke-dasharray="5 4"'));
 assert.ok(svg.includes('stroke="'+gfx.COLORS.blue+'"'));
 assert.ok(svg.includes('stroke="'+gfx.COLORS.border+'"'));
 assert.equal(p.radius,100);
 assert.ok(records.some(row=>row[0]==='arc'&&row[3]===100));
}
const short=gfx.svgDoor({...arcs[1],radius:16},16,3);
assert.ok(short.includes('<circle'),'Pequenas portas mantêm dobradiça');
assert.ok(!short.includes('stroke-dasharray'),'Arco omitido apenas em vista compacta');
assert.ok(existsSync(resolve(root,'js/architectural-glyphs.js')));
console.log('UIUX-0.9.2 — Parede e porta Canvas/SVG: OK');
