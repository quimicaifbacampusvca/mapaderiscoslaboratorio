import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const css=readFileSync(resolve(root,'css/acessibilidade.css'),'utf8');
const sw=readFileSync(resolve(root,'sw.js'),'utf8');
for(const s of [
  'grid-template-columns:minmax(0,1fr)',
  '.settings-panel .mrl-a11y-row > span',
  'overflow-wrap:anywhere',
  '.mrl-a11y-reset,#mrlEnableVlibras',
  'max-width:100%',
  'white-space:normal'
]) assert.ok(css.includes(s),'Falta contenção responsiva: '+s);
assert.match(sw,/uiux-0\.9\.3\.3\.2-mobile-a11y-v1/);
assert.match(sw,/\.\/css\/acessibilidade\.css/);
assert.doesNotMatch(css,/\b(?:indexedDB|drawImage|localStorage)\s*\(/);
console.log('UIUX-0.9.3.3.2 — contenção tipográfica móvel e cache: OK');
