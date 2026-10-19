import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(readFileSync(resolve(root,'manifest.webmanifest'),'utf8'));
const python=readFileSync(resolve(root,'portable/servidor.py'),'utf8');
const ps=readFileSync(resolve(root,'portable/servidor-windows.ps1'),'utf8');
const sw=readFileSync(resolve(root,'sw.js'),'utf8');
assert.equal(manifest.id,'/mapaderiscoslaboratorio/');
assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
for(const origin of ['https://example.github.io','http://127.0.0.1:8765']){
 const app=origin+'/mapaderiscoslaboratorio/';
 assert.equal(new URL(manifest.id,app).href,app);
 assert.equal(new URL(manifest.start_url,app).href,app);
 assert.equal(new URL(manifest.scope,app).href,app);
 assert.notEqual(new URL(manifest.id,app).href,origin+'/');
}
assert.match(python,/APP_PATH = '\/mapaderiscoslaboratorio\/'/);
assert.match(python,/def translate_path\(self, path\)/);
assert.match(ps,/\$appPath = '\/mapaderiscoslaboratorio\/'/);
assert.match(sw,/uiux-0\.9\.2-header-settings-v1/);
assert.doesNotMatch(sw,/localStorage|indexedDB/);
console.log('UIUX-0.9.1.2 — identidade PWA e escopos isolados: OK');
