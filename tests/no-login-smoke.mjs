import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const html=readFileSync(join(root,'index.html'),'utf8');
const js=readFileSync(join(root,'js/mapa.js'),'utf8');
assert.ok(!html.includes('id="loginScreen"'));
assert.ok(!html.includes('id="authForm"'));
assert.ok(!html.includes('homeLogoutBtn'));
assert.ok(!html.includes('userRoomsSection'));
for (const name of ['auth.js','room-gas.js','config.js','crypto.js']) {
 assert.ok(!html.includes(`src="js/${name}"`));
}
assert.equal(existsSync(join(root,'js/auth.js')),false);
assert.match(html, /id="homeScreen"/);
for (const id of ['homeNewProject','homeOpenProject','homeUseModel','homeImportModel','homeContinue']) assert.ok(html.includes(`id="${id}"`));
assert.match(js, /addEventListener\("click", resetToNewProject\)/);
assert.match(js, /function showHomeScreen\(/);
assert.match(js, /showHomeScreen\(\);\s*\}\);/);
assert.doesNotMatch(js, /AuthAPI|bootstrapLocalSession|function showLoginScreen|state\.user\?\.papel/);
assert.match(js, /const canEdit = \(\) => true/);
console.log('No-login frontend smoke tests: OK');
