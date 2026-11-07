import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const sandbox = {console};
vm.createContext(sandbox);
for (const filename of ['js/types.js', 'js/geometry.js', 'js/validation.js'])
  vm.runInContext(read(filename), sandbox, {filename});
vm.runInContext(`Object.assign(globalThis, {
  TYPES, RISK_TYPES, getObjectCorners, checkRectangleOverlap, getIntersectionArea,
  isSupportedItemContainedOnBase, isExitClearanceBlocked, calculateDoorBlockRatio,
  validateObject
});`, sandbox);

const room = {w:10, h:8};
const door = {id:'porta',type:'door',x:4,y:6,w:1,h:.12,rot:0};
const bench = {id:'bancada',type:'bench',x:4.1,y:6,w:.3,h:.5,rot:0,hidden:true};
assert.equal(sandbox.validateObject(door,[door,bench],room).valid,false,
  'Obstrução oculta não pode aprovar a saída');
assert.equal(sandbox.validateObject(bench,[bench,door],room).valid,false,
  'Objetos ocultos devem participar da validação física');
assert.equal(sandbox.isExitClearanceBlocked(door,[door,bench]),true,
  'Objeto oculto deve participar da verificação de aproximação');
assert.equal(sandbox.calculateDoorBlockRatio(door,bench)>0,true);
assert.equal(sandbox.validateObject(door,[door],room).valid,true,
  'Porta isolada e dentro da área deve ser válida');

const verticalDoor = {id:'d2',type:'door',x:2,y:2,w:.12,h:1,rot:0};
const verticalBlocker = {id:'b2',type:'bench',x:2,y:2.4,w:.3,h:.2,rot:0};
assert.ok(sandbox.calculateDoorBlockRatio(verticalDoor,verticalBlocker)>0,
  'A largura útil de uma porta vertical deve seguir o maior eixo');

const a = {id:'a',type:'bench',x:0,y:0,w:2,h:1,rot:45};
const b = {id:'b',type:'bench',x:0,y:0,w:2,h:1,rot:45};
assert.ok(Math.abs(sandbox.getIntersectionArea(a,b)-2)<1e-6,
  'Áreas idênticas rotacionadas devem preservar a área');
const separate = {id:'c',type:'bench',x:5,y:5,w:1,h:1,rot:0};
assert.equal(sandbox.getIntersectionArea(a,separate),0,
  'Objetos disjuntos não podem ter área de interseção');

const lbase = {id:'l',type:'benchL',x:0,y:0,w:2,h:2,rot:45};
const small = {id:'s',type:'equipment',x:1.126,y:.108,w:.2,h:.2,rot:45};
assert.equal(sandbox.isSupportedItemContainedOnBase(small,lbase),true,
  'Equipamento apoiado dentro do braço girado da bancada L deve ser aceito');
const offBase = {id:'f',type:'equipment',x:1.5,y:1.5,w:.25,h:.25,rot:0};
assert.equal(sandbox.isSupportedItemContainedOnBase(offBase,lbase),false,
  'Equipamento fora da superfície não pode ser aceito');

const validation = read('js/validation.js');
assert.doesNotMatch(validation,/80%|0\.8\s*\)\s*\{.*NR-23/,
  'Não atribuir tolerância de 80% à NR-23');
const mapa = read('js/mapa.js');
assert.match(mapa,/if\(!isObjectValid\(e,activeObjects\)\.valid\)/,
  'Pontuação de saída deve consultar o campo valid');
assert.match(mapa,/state\.selectedObjects\.some\(o=>o\.locked\).*Desbloqueie os elementos antes de excluir/,
  'Exclusão deve respeitar bloqueio');
assert.match(mapa,/let rotationEditActive = false/,
  'Rotação deve preservar uma transação de histórico');
assert.match(mapa,/const activeObjects=area\.objetos;/,
  'Critérios devem considerar objetos físicos ocultos');
assert.match(read('index.html'),/Indicadores de preenchimento, não uma certificação normativa/,
  'Placar não pode se apresentar como laudo');
assert.equal(Object.keys(sandbox.TYPES).length,23);

// A caixa externa da bancada L cobre um espaço fisicamente vazio.
// Um objeto nessa região não pode causar falsa colisão ou falso bloqueio.
const emptyCornerDoor = {id:'saida-canto',type:'door',x:3,y:3,w:.9,h:.12,rot:0};
const emptyCornerL = {id:'l-canto',type:'benchL',x:0,y:0,w:2,h:2,rot:0};
assert.equal(sandbox.isExitClearanceBlocked(emptyCornerDoor,[emptyCornerDoor,emptyCornerL]),false);
assert.equal(sandbox.validateObject(emptyCornerL,[emptyCornerDoor,emptyCornerL],room).valid,true);

// A nota de saída deve avaliar a validade real do objeto, mesmo com obstáculos ocultos.
const calcStart = mapa.indexOf('function calculateCompliance(area){');
const calcEnd = mapa.indexOf('/**\n * Atualiza visualmente os dez checks',calcStart);
assert.ok(calcStart >= 0 && calcEnd > calcStart,'Função de cálculo de avaliação não encontrada');
const area = {id:'laboratorio',dimensoes:room,objetos:[door,bench]};
const scoreContext = {
  state:{areaAtiva:'outra-area'},
  EXITS:['door','exit'],
  RISK_TYPES:[...sandbox.RISK_TYPES],
  isObjectValid:(obj,objects)=>sandbox.validateObject(obj,objects,area.dimensoes)
};
vm.createContext(scoreContext);
vm.runInContext(mapa.slice(calcStart,calcEnd)+'\nglobalThis.calculateCompliance=calculateCompliance;',scoreContext);
const obstructedScore=scoreContext.calculateCompliance(area);
assert.equal(obstructedScore.checks['check-exit'],false,
  'Uma saída obstruída não pode receber aprovação didática');
assert.equal(scoreContext.state.areaAtiva,'outra-area',
  'O cálculo não pode mudar permanentemente a área ativa');
const hiddenChemical={id:'r-oculto',type:'chemical',x:5,y:2,w:1,h:1,rot:0,hidden:true,epi:'Óculos'};
area.objetos=[door,hiddenChemical];
const safeScore=scoreContext.calculateCompliance(area);
assert.equal(safeScore.checks['check-exit'],true);
assert.equal(safeScore.checks['check-chemical-bio'],true,
  'A ocultação visual não pode remover riscos do inventário');
assert.equal(safeScore.checks['check-epi'],true,
  'EPIs de riscos ocultos devem continuar inventariados');

// Proteção do vínculo de porta é uma regra de domínio, não apenas disabled do seletor.
assert.match(mapa,/state\.selectedObjects\[0\]\.type === "door" && !state\.selectedObjects\[0\]\.locked/,
  'A ligação de uma porta bloqueada não pode ser modificada');
assert.match(mapa,/doorConnection\.disabled = o\.locked/,
  'O seletor visual deve refletir a restrição de edição');

console.log('C01/E03: contratos de inventário, geometria e segurança OK');
