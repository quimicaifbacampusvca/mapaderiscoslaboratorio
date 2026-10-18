import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const app = readFileSync(join(root,'js/mapa.js'),'utf8');
const css = readFileSync(join(root,'css/mapa.css'),'utf8');
const html = readFileSync(join(root,'index.html'),'utf8');
for (const id of ['confirmModal','modelsModal','shortcutsModal','complianceReportModal']) {
  assert.match(html,new RegExp(`id="${id}"`));
  assert.ok(app.includes(`"${id}"`),`Falta referência a ${id}`);
}
assert.match(app,/function topAppModal\(/);
assert.match(app,/function showAppModal\(/);
assert.match(app,/function hideAppModal\(/);
assert.match(app,/function syncAppModalState\(/);
assert.match(app,/modal\.inert = Boolean\(top\) && modal !== top/);
assert.match(app,/event\.stopImmediatePropagation\(\)/);
assert.match(app,/appFocusableElements\(top\)/);
assert.match(app,/function showConfirmModal[\s\S]*?!confirmModal\?\.isConnected/);
assert.match(app,/Diálogo de confirmação indisponível; ação bloqueada/);
assert.doesNotMatch(app,/onConfirm\?\.\(\);\s*return Promise\.resolve\(true\);/);
assert.match(app,/toast\.setAttribute\("role", type === "error" \? "alert" : "status"\)/);
assert.match(app,/while \(container\.children\.length >= 3\)/);
assert.match(app,/const globalToastHost = \$\("toastContainer"\)/);
assert.match(css,/\.modal-card \{ display:flex; flex-direction:column/);
assert.match(css,/\.modal-body \{ min-width:0; min-height:0; flex:1 1 auto/);
assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
console.log('UIUX-0.4.0 — modal and component contract: OK');
