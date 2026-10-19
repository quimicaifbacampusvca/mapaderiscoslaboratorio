import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const editor = readFileSync(join(root, 'js/mapa.js'), 'utf8');
const ui = readFileSync(join(root, 'js/library-ui.js'), 'utf8');
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const start = editor.indexOf('const AUTOSAVE_KEY = "mapa_riscos_autosave";');
const end = editor.indexOf('// --- RENDERIZADOR OTIMIZADO ---');
assert.ok(start >= 0 && end > start, 'O bloco do autosave deve existir');
const persistence = editor.slice(start, end);

const recorded = [], warnings = [];
const area = { id:'area1', nome:'Laboratório', dimensoes:{w:12,h:8}, objetos:[] };
const sandbox = {
  state:{areas:[area],areaAtiva:'area1'},
  window:{dispatchEvent(event){ recorded.push(event); }},
  CustomEvent:class {constructor(type, options){this.type=type;this.detail=options.detail;}},
  localStorage:{setItem(){ throw new Error('QuotaExceededError'); },getItem(){return null;}},
  showToast:(...args)=>warnings.push(args),
  scheduleRoomSync(){throw Error('Não sincronizar se localStorage falhar');},
  console:{warn(){}},
  clearTimeout(){},
  setTimeout(fn){sandbox.timer=fn;return 1},
};
vm.createContext(sandbox);
vm.runInContext(persistence + '\nglobalThis.__test = {persistDraftNow,scheduleAutoSave};', sandbox);
assert.equal(sandbox.__test.persistDraftNow(),false,'Persistência principal sinaliza falha sem fingir sucesso');
assert.equal(recorded.length,1,'Falha no localStorage ainda deve produzir snapshot para IndexedDB');
assert.equal(recorded[0].type,'mapa:autosaved');
assert.equal(recorded[0].detail.localSaved,false);
assert.equal(recorded[0].detail.payload.areas[0].dimensoes.w,12);
assert.ok(warnings.length>=1,'Deve avisar o usuário do risco de perda de dados');
area.dimensoes.w=18;
sandbox.__test.scheduleAutoSave();
sandbox.timer();
assert.equal(recorded.length,2,'Timer deve disparar persistência alternativa');
assert.equal(recorded[1].detail.payload.areas[0].dimensoes.w,18);
assert.equal(recorded[1].detail.localSaved,false);
assert.ok(ui.includes('const draftSaved = runtime.persist();'));
assert.ok(ui.includes('await saveCaptured(currentId,payload,titleFor(payload),{revision});'));
assert.ok(!ui.includes('if(!runtime.persist())return;'), 'Guardar revisão não pode depender da quota do autosave');
assert.match(sw,/CACHE_PREFIX \+ 'uiux-0\.9\.3\.3-dialog-theme-v1'/,'A correção deve entrar num cache novo do PWA');
console.log('UIUX-0.9.0 — fallback independente para IndexedDB e aviso de quota: OK');
