import fs from 'node:fs';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../gas/Code.gs',import.meta.url),'utf8');
for (const item of ['senhaHash','senhaSalt','resetToken','resetExpira']) assert.ok(code.includes(item));
for (const action of ['authRegister','authLogin','authMe','authLogout','authForgotPassword','authResetPassword']) assert.ok(code.includes(`case '${action}'`));
assert.ok(!code.includes('verifyIdToken'));
console.log('Email/password GAS smoke: OK');
