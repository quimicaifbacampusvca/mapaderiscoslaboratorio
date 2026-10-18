import fs from 'node:fs';
import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../js/mapa.js',import.meta.url),'utf8');
for(const name of ['submitAuthForm','createRoomFromLogin','enterRoomFromServer','bootstrapLocalSession','bootstrapRoomSession']) assert.ok(src.includes(`function ${name}(`),name);
assert.match(src,/await AuthAPI\.validateSession\(\)/);
assert.match(src,/await enterRoomFromServer\(data\.sala, "professor"\)/);
assert.match(src,/await AuthAPI\.loginUser/);
assert.match(src,/await AuthAPI\.registerUser/);
console.log('Login and room flow contract smoke: OK');
