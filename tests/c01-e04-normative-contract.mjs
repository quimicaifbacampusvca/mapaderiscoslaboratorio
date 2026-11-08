import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const mapa = read('js/mapa.js');
const html = read('index.html');
const tipos = read('js/types.js');
const validacao = read('js/validation.js');

// N01/N02: nenhuma mensagem de status apresenta os checks como laudo normativo.
assert.doesNotMatch(mapa, /Revise os critérios de conformidade para concluir/);
assert.match(mapa, /Revise os itens de preenchimento didático para concluir/);
assert.match(html, /Indicadores de preenchimento, não uma certificação normativa/);
assert.match(html, /Registro de EPI associado a um risco \(não valida sua adequação\)/);

// N04: o campo não recomenda EPI pela categoria, sem avaliação da atividade.
assert.doesNotMatch(html, /EPI recomendado \(NR-6\)/);
assert.match(html, /Registro de EPI \(sujeito à avaliação da atividade/);
assert.doesNotMatch(tipos, /Dosímetro e proteção individual adequada/);
assert.match(tipos, /Identifique substância, atividade e EPI avaliado/);

// N03: o limite de 40% continua declarado heurística; não é tolerância legal.
assert.match(validacao, /gatilho de 40%, sem tolerância normativa universal/);
assert.match(read('js/geometry.js'), /NÃO um limite legal universal/);
assert.match(html, /3 × 3 m, critério didático/);

const sandbox = {console};
vm.createContext(sandbox);
for (const file of ['js/types.js', 'js/geometry.js', 'js/validation.js']) {
  vm.runInContext(read(file), sandbox, {filename:file});
}
vm.runInContext('globalThis.runValidation = validateObject;', sandbox);
const room = {w:10, h:10};
const exit = {id:'porta',type:'door',x:4,y:4,w:1,h:.12,rot:0};
const blocker = {id:'b',type:'bench',x:4.2,y:4,w:.4,h:.4,rot:0,hidden:true};
const obstruction = sandbox.runValidation(exit,[exit,blocker],room);
assert.equal(obstruction.valid,false, 'E04-T01: esconder não remove obstrução da saída');
assert.match(obstruction.problems.join(' '), /NR-23, item 23\.3\.4\.1/);
const zone = {id:'circulacao',type:'zone',x:2,y:2,w:2,h:2,rot:0};
const bench = {id:'b2',type:'bench',x:2.1,y:2.1,w:1.8,h:1.8,rot:0};
const warn = sandbox.runValidation(zone,[zone,bench],room);
assert.match(warn.problems.join(' '), /gatilho de 40%, sem tolerância normativa universal/,
  'E04-T04: a sobreposição significativa deve ser descrita como alerta didático');

// N05: esconder risco/estrutura não deve retroceder os passos de preenchimento.
const start = mapa.indexOf('function updateStepper() {');
const end = mapa.indexOf('/**\n * Atualiza os diferentes painéis',start);
assert.ok(start >= 0 && end > start, 'Localização do stepper mudou');
const classes = () => {
  const current = new Set();
  return {current, add:(x)=>current.add(x), remove:(...xs)=>xs.forEach(x=>current.delete(x))};
};
const step1 = {classList:classes(), removeAttribute(){}, setAttribute(){}};
const step2 = {classList:classes(), removeAttribute(){}, setAttribute(){}};
const step3 = {classList:classes(), removeAttribute(){}, setAttribute(){}};
const hint = {textContent:''};
const els = {'step-1':step1,'step-2':step2,'step-3':step3,
  stepperHint:hint,'compliance-badge':{textContent:'0/10'}};
const ui = {state:{objects:[{type:'wall',hidden:true},{type:'chemical',hidden:true}]},
  RISK_TYPES:['chemical'], $:(id)=>els[id], document:{querySelectorAll:()=>[]}};
vm.createContext(ui);
vm.runInContext(mapa.slice(start,end) + '\nglobalThis.runStepper=updateStepper;',ui);
ui.runStepper();
assert.equal(step1.classList.current.has('done'),true);
assert.equal(step2.classList.current.has('done'),true);
assert.equal(step3.classList.current.has('active'),true);
assert.match(hint.textContent, /preenchimento didático/);

// N06/T10: regressões de estrutura e persistência continuam na suíte C01/E03.
console.log('C01/E04: linguagem normativa, circulação, EPI e ocultação OK');
