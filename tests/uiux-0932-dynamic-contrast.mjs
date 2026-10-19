import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const R=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(R,p),'utf8');
const css=read('css/temas-contraste.css');
const sw=read('sw.js');
for(const sel of ['#recentList .recent-chip','#totalObjectsBadge','.input-unit > span','#roomFeedback','.proto-section-caption > span','header.topbar .identity-blue','.proto-showcase-head']){
  assert.ok(css.includes(sel),'Falta correção: '+sel);
}
for(const token of ['--mrl-ui-control-ink','--mrl-ui-ink','--mrl-ui-line','--mrl-ui-muted','--mrl-ui-surface']){
  assert.ok(css.includes(token),'Falta variável de tema: '+token);
}
assert.match(sw,/uiux-0\.9\.3\.3-dialog-theme-v1/);
assert.match(sw,/\.\/css\/temas-contraste\.css/);
assert.doesNotMatch(css,/\b(?:indexedDB|localStorage|drawImage)\s*\(/);
for(const path of ['js/mapa.js','js/types.js','js/project-library.js']) assert.ok(read(path).length>1000);
console.log('UIUX-0.9.3.2: contraste dinâmico, temas e PWA: OK');
