import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(resolve(root,p),'utf8');
const sw = read('sw.js'), html=read('index.html');
const shell=sw.match(/const SHELL_PATHS\s*=\s*\[([^\]]+)\]/s)?.[1];
assert.ok(shell,'O service worker deve declarar arquivos do shell offline');
const paths=[...shell.matchAll(/['"](\.\/[^'"]*)['"]/g)].map(x=>x[1].replace(/^\.\//,''));
for(const file of paths){if(!file)continue;assert.ok(existsSync(resolve(root,file)),file);}
const refs=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(x=>x[1])
  .filter(s=>!s.startsWith('#') && !/^https?:/.test(s));
for(const path of refs){assert.ok(existsSync(resolve(root,path)),path);}
for(const p of ['portable/servidor.py','portable/servidor-windows.ps1','portable/iniciar.cmd','portable/iniciar.sh','tools/montar-portatil.py','tools/validar-portatil.py','LEIA-ME-OFFLINE.md']){
  assert.ok(existsSync(resolve(root,p)),p);
}
assert.match(read('portable/servidor.py'),/127\.0\.0\.1/);
assert.match(read('portable/servidor.py'),/APP_PATH = '\/mapaderiscoslaboratorio\/'/);
assert.match(read('portable/servidor-windows.ps1'),/\$appPath = '\/mapaderiscoslaboratorio\/'/);
assert.match(read('portable/servidor-windows.ps1'),/Loopback/);
assert.match(read('LEIA-ME-OFFLINE.md'),/GitHub Pages e a edi[cç][aã]o port[aá]til n[aã]o compartilham automaticamente/);
assert.ok(!/(?:https?:)?\/\/(?:cdn\.|fonts\.googleapis|unpkg|jsdelivr)/i.test(html+read('css/mapa.css')+read('css/identidade-alerta-precisao.css')));
assert.ok(!paths.some(p=>p.endsWith('.json') && p!=='manifest.webmanifest'));
console.log(`UIUX-0.8.4 — contrato da distribuição portátil: OK (${paths.length} entradas de cache e ${refs.length} recursos HTML)`);
