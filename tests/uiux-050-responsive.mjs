import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'css/mapa.css'), 'utf8');
const js = readFileSync(join(root, 'js/mapa.js'), 'utf8');
assert.match(html, /class="topbar-action-cluster" aria-label="Ações do projeto"/);
for (const id of ['undo','redo','btnShortcuts','save','exportSvg','load','btnToggleTools','btnToggleProps','closeToolsPanel','closePropsPanel']) {
  assert.ok(html.includes(`id="${id}"`), `${id} não pode ser ocultado/removido do DOM`);
}
assert.match(css, /UIUX-0\.5\.0/);
assert.match(css, /@media \(min-width:769px\) and \(max-width:1100px\)/);
assert.match(css, /@media \(max-height:540px\)/);
assert.match(css, /--uiux-header-height/);
assert.match(js, /window\.matchMedia\("\(max-width: 1100px\)"\)/);
assert.match(js, /document\.dispatchEvent\(new Event\("mapa:close-mobile-panels"\)\)/);
assert.match(js, /leftPanel\.inert = true/);
assert.match(js, /rightPanel\.inert = true/);
assert.match(js, /panelReturnFocus\.focus\(\{ preventScroll: true \}\)/);
assert.match(js, /syncPanelOffset\(\)/);
assert.match(js, /state\.cam\.zoom/);
console.log('UIUX-0.5.0 — responsive invariants: OK');
