import fs from 'node:fs';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../gas/Code.gs',import.meta.url),'utf8');
for(const name of ['authRegister','authLogin','authLogout','authMe','authForgotPassword','authResetPassword','ensureAuthenticated','createRoom','joinRoom','saveProject','setupMasterSpreadsheet']) assert.ok(code.includes(`function ${name}(`), name);
assert.match(code,/case 'authMe': return authMe\(data\)/);
assert.match(code,/const USUARIOS_HEADERS/);
console.log('GAS auth contract smoke: OK');
