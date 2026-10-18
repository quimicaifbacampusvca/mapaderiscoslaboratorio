import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(root,'index.html'),'utf8');
const app = readFileSync(join(root,'js/mapa.js'),'utf8');
const css = readFileSync(join(root,'css/mapa.css'),'utf8');
assert.ok(!html.includes('Sem login. O projeto atual é salvo automaticamente neste navegador'));
assert.ok(!html.includes('home-storage-note'));
assert.ok(!css.includes('.home-storage-note'));
for (const tab of ['layers','properties','report']) {
  assert.match(html, new RegExp(`id="panelTab-${tab}"[^>]*aria-controls="panelContent-${tab}"`));
  assert.match(html, new RegExp(`id="panelContent-${tab}"[^>]*aria-labelledby="panelTab-${tab}"`));
}
for (const id of ['selectMode','panMode','grid','snap','ruler']) assert.match(html,new RegExp(`<button[^>]*id="${id}"[^>]*aria-pressed="(?:true|false)"`));
assert.match(html, /id="toastContainer"[^>]*aria-live="off"/);
assert.match(app, /toast\.setAttribute\("aria-atomic", "true"\)/);
assert.match(app, /dataset\.toastText === normalizedMessage/);
assert.match(app, /\["ArrowRight", "ArrowLeft", "Home", "End"\]/);
assert.match(app, /e\.altKey && e\.shiftKey && !isCtrl/);
assert.match(app, /\["l", "p", "d"\]/);
assert.match(app, /if \(\$\("app"\)\?\.classList\.contains\("hidden"\) \|\| topAppModal\(\)\) return/);
assert.match(app, /if \(!canvasFocused && !\(isCtrl/);
assert.doesNotMatch(app, /isCtrl && e\.key\.toLowerCase\(\) === "l"/);
assert.doesNotMatch(app, /isCtrl && e\.key\.toLowerCase\(\) === "p"/);
assert.match(css, /UIUX-0\.6\.0/);
assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
console.log('UIUX-0.6.0 — acessibilidade e remoção do aviso: OK');
