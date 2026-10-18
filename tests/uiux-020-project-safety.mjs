import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(root,'index.html'),'utf8');
const js = readFileSync(join(root,'js/mapa.js'),'utf8');
for (const id of ['homeNewProject','homeContinue','homeRestorePrevious','confirmBackup','previousProjectRow','homeStorageWarning']) {
  assert.ok(html.includes(`id="${id}"`), `Controle ausente: ${id}`);
}
assert.doesNotMatch(html, /id="logoutBtn"/);
assert.match(html, /id="save"[^>]+aria-label="Baixar arquivo JSON do projeto"/);
assert.match(js, /function confirmProjectReplacement\(/);
assert.match(js, /function replaceProjectSafely\(/);
assert.match(js, /RECOVERY_KEY\s*=\s*"mapa_riscos_previous_autosave"/);
assert.match(js, /on\("save", "click", \(\) => \{\s*if \(!canEdit\(\)\) return;\s*downloadProjectJSON\(\)/);
assert.match(js, /clearTimeout\(autoSaveTimer\);\s*autoSaveTimer = null;\s*const fresh/);
assert.match(js, /validateProjectPayload\(data\)/);
assert.match(js, /function updateHomeRecent\(/);
console.log('UIUX-0.2.0 static safety smoke: OK');
