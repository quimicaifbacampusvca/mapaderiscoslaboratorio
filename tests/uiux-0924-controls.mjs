import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const read=p=>readFileSync(join(root,p),'utf8');
const html=read('index.html'),sw=read('sw.js'),js=read('js/styled-selects.js'),css=read('css/controls-consistency.css');
for(const id of ['areaType','areaSelect','doorConnection']) {
  assert.ok(html.includes('id="'+id+'"'),'Missing select '+id);
  assert.ok(js.includes("'"+id+"'"),'Missing styled select '+id);
}
for(const tag of ['role', 'combobox','listbox','option','aria-expanded','aria-selected','aria-activedescendant','aria-label']) assert.ok(js.includes(tag));
for(const key of ['ArrowDown','ArrowUp','Home','End','Escape','Tab','Enter']) assert.ok(js.includes(key));
assert.ok(js.includes("new MutationObserver(sync)"));
assert.ok(js.includes("select.dispatchEvent(new Event('change'"));
assert.ok(html.includes('css/controls-consistency.css'));
assert.ok(html.includes('js/styled-selects.js'));
assert.ok(sw.includes('./css/controls-consistency.css'));
assert.ok(sw.includes('./js/styled-selects.js'));
assert.ok(sw.includes('uiux-0.9.2.4-styled-controls-v1'));
assert.ok(css.includes('.mrl-select-listbox'));
assert.ok(css.includes('input[type="range"]'));
assert.ok(css.includes('::file-selector-button'));
assert.ok(css.includes('summary:focus-visible'));
console.log('UIUX-0.9.2.4 — contrato de seletor visual, teclado e cache: OK');