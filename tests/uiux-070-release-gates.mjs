import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'css/mapa.css'), 'utf8');
const js = readFileSync(join(root, 'js/mapa.js'), 'utf8');
const ruler = readFileSync(join(root, 'js/metric-ruler.js'), 'utf8');
assert.match(css, /UIUX-0\.7\.0[\s\S]*@media\s*\(max-width:\s*540px\)[\s\S]*\.home-card:focus-visible\s*\{\s*transform:\s*none;/);
assert.match(html, /id="homeNewProject"/);
assert.match(html, /id="homeContinue"/);
assert.match(html, /id="ruler"/);
assert.doesNotMatch(html, /Sem login\. O projeto atual é salvo automaticamente/);
assert.doesNotMatch(html, /id="logoutBtn"/);
assert.match(js, /showConfirmModal/);
assert.match(js, /mapa_riscos_previous_autosave/);
assert.match(ruler, /0\.01|1\s*\/\s*100/);
for (const file of ['uiux-020-project-safety.mjs', 'uiux-030-metric-ruler.mjs', 'uiux-040-dialogs.mjs', 'uiux-050-responsive.mjs', 'uiux-060-a11y.mjs']) {
  assert.ok(existsSync(join(root, 'tests', file)), `Missing baseline: ${file}`);
}
console.log('UIUX-0.7.0 — release gate static smoke: OK');