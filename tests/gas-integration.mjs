import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const source = fs.readFileSync(new URL('../gas/Code.gs', import.meta.url), 'utf8');
const headers = {
  usuarios: ['id','email','nome','foto','papel','criadoEm','ultimoAcesso'],
  salas: ['codigo','status','criadorId','criadaEm','projeto','projetoDriveId','participantes'],
  sinalizacao: ['codigoSala','remetente','destinatario','tipo','payload','timestamp'],
  projetos: ['codigoSala','versao','salvoEm','projeto']
};
const records = {};
for (const [key, header] of Object.entries(headers)) records[key] = [header.slice()];
records.usuarios.push(['legacy-google','legacy@school.test','Antiga Conta Google','', 'professor','2024-01-01','2024-01-02']);
const mail = [];
const cache = new Map();
const props = new Map([
  ['SPREADSHEET_ID','https://docs.google.com/spreadsheets/d/1E4iWL8Z0uTGFJNBB3Mh58OsVOoiLVhm-2kOUVLpfYgE/edit'],
  ['FRONTEND_URL','https://quimicaifbacampusvca.github.io/mapaderiscoslaboratorio/index.html'],
  ['TEST_UNUSED','unused']
]);
const files = new Map();
const range = (name, row, column, height=1, width=1) => ({
  getValues() { return Array.from({length:height},(_,i)=>Array.from({length:width},(_,j)=>(records[name][row+i-1]||[])[column+j-1]??'')); },
  setValues(value) { for(let i=0;i<height;i++){ records[name][row+i-1] ||= []; for(let j=0;j<width;j++) records[name][row+i-1][column+j-1]=value[i][j]; } return this; },
  setValue(value) { records[name][row-1] ||= []; records[name][row-1][column-1]=value; return this; },
  setFontWeight() { return this; }
});
function sheet(name) { return {
  getName:()=>name, getLastRow:()=>records[name].length,
  getLastColumn:()=>Math.max(...records[name].map(row=>row.length)),
  getRange:(r,c,h,w)=>range(name,r,c,h,w),
  getDataRange:()=>({getValues:()=>records[name].map(r=>Array.from({length:Math.max(...records[name].map(x=>x.length))},(_,i)=>r[i]??''))}),
  appendRow:(r)=>records[name].push(r.slice()),
  setFrozenRows:()=>{}, deleteRow:(n)=>records[name].splice(n-1,1)
}; }
const ss={
  getSheetByName:(n)=>records[n]?sheet(n):null,
  insertSheet:(n)=>{records[n]=[];return sheet(n);},
  getId:()=>props.get('SPREADSHEET_ID').match(/\/d\/([^/]+)/)[1],
  getName:()=> 'Planilha existente',
  getUrl:()=>props.get('SPREADSHEET_ID'),
};
const driveFolder={
  createFile:(name,content)=>{const id='file-'+files.size; const file={getId:()=>id,setContent:(v)=>{file.value=v},getBlob:()=>({getDataAsString:()=>file.value}),value:content}; files.set(id,file);return file;}
};
const ctx={
  console,
  Date,
  PropertiesService:{getScriptProperties:()=>({getProperty:(k)=>props.get(k),setProperty:(k,v)=>props.set(k,v),deleteProperty:(k)=>props.delete(k)})},
  SpreadsheetApp:{openById:(id)=>{assert.equal(id,ss.getId());return ss}},
  LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},
  CacheService:{getScriptCache:()=>({put:(k,v)=>cache.set(k,v),get:(k)=>cache.get(k),remove:(k)=>cache.delete(k)})},
  Utilities:{
    getUuid:()=>crypto.randomUUID(),
    computeDigest:(_,v)=>Array.from(crypto.createHash('sha256').update(v).digest()).map(x=>x>127?x-256:x),
    DigestAlgorithm:{SHA_256:'sha256'}, Charset:{UTF_8:'utf8'},
  },
  ContentService:{createTextOutput:(txt)=>({setMimeType(){return this},text:txt}),MimeType:{JSON:'application/json'}},
  DriveApp:{getFoldersByName:()=>({hasNext:()=>true,next:()=>driveFolder}),createFolder:()=>driveFolder,getFileById:(id)=>{if(!files.has(id))throw Error('File missing');return files.get(id)}},
  MimeType:{PLAIN_TEXT:'text/plain',JSON:'application/json'},
  MailApp:{sendEmail:(to,sub,body)=>mail.push({to,sub,body})}
};
vm.createContext(ctx);
vm.runInContext(source,ctx);
const invoke=(action,body={})=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify({action,...body})}}).text);
const denied = invoke('authRegister',{nome:'Professor Intruso',email:'evil@school.test',senha:'pass1234',papel:'professor'});
assert.equal(denied.code,'TEACHER_APPROVAL_REQUIRED');
const setup=ctx.setupMasterSpreadsheet();
assert.equal(setup.created,false);
assert.deepEqual(records.usuarios[0].slice(0,7),headers.usuarios);
assert.equal(records.usuarios[1][0],'legacy-google');
assert.ok(records.usuarios[0].includes('senhaHash'));
const teacherRegister=invoke('authRegister',{nome:'Professor Teste',email:'teacher@school.test',senha:'pass1234',papel:'estudante'});
assert.equal(teacherRegister.ok,true,JSON.stringify(teacherRegister));
props.set('PROMOTE_PROFESSOR_EMAIL','teacher@school.test');
ctx.promoteConfiguredProfessor();
assert.equal(props.has('PROMOTE_PROFESSOR_EMAIL'),false);
const teacher=invoke('authLogin',{email:'teacher@school.test',senha:'pass1234',papel:'professor'});
assert.equal(teacher.ok,true,JSON.stringify(teacher));
assert.equal(teacher.usuario.papel,'professor');
const student=invoke('authRegister',{nome:'Aluno Teste',email:'student@school.test',senha:'pass1234',papel:'estudante'});
assert.equal(student.ok,true);
assert.equal(invoke('authLogin',{email:'teacher@school.test',senha:'errada'}).code,'INVALID_CREDENTIALS');
assert.equal(invoke('authLogin',{email:'teacher@school.test',senha:'pass1234',papel:'professor'}).ok,true);
assert.equal(invoke('authLogin',{email:'legacy@school.test',senha:'123456'}).code,'ACCOUNT_MIGRATION_REQUIRED');
assert.equal(invoke('authMe',{sessionToken:teacher.sessionToken}).usuario.papel,'professor');
const room=invoke('criar',{sessionToken:teacher.sessionToken});
assert.equal(room.ok,true);
assert.equal(invoke('criar',{sessionToken:student.sessionToken}).code,'FORBIDDEN');
const joined=invoke('entrar',{sessionToken:student.sessionToken,codigo:room.sala.codigo});
assert.equal(joined.sala.papel,'estudante');
const layout={version:4,areas:[{id:'a1',nome:'Laboratório',objetos:[]}],areaAtiva:'a1'};
const saved=invoke('salvar',{sessionToken:teacher.sessionToken,codigo:room.sala.codigo,projeto:layout});
assert.equal(saved.ok,true,JSON.stringify(saved));
assert.equal(invoke('salvar',{sessionToken:student.sessionToken,codigo:room.sala.codigo,projeto:layout}).code,'FORBIDDEN');
assert.equal(invoke('entrar',{sessionToken:student.sessionToken,codigo:room.sala.codigo}).sala.projeto.areas[0].nome,'Laboratório');
const giant={version:4,areas:[{id:'a1',nome:'X'.repeat(45500),objetos:[]}],areaAtiva:'a1'};
assert.equal(invoke('salvar',{sessionToken:teacher.sessionToken,codigo:room.sala.codigo,projeto:giant}).ok,true);
assert.equal(invoke('entrar',{sessionToken:student.sessionToken,codigo:room.sala.codigo}).sala.projeto.areas[0].nome.length,45500);
assert.equal(invoke('authForgotPassword',{email:'teacher@school.test'}).ok,true);
assert.equal(mail.length,1);
assert.match(mail[0].body,/index\.html\?resetToken=/);
const link=mail[0].body.match(/https:\/\/\S+resetToken=\S+/)[0];
const url=new URL(link);
assert.equal(invoke('authResetPassword',{email:'teacher@school.test',token:'incorrect',senha:'newpassword'}).code,'INVALID_RESET_TOKEN');
assert.equal(invoke('authResetPassword',{email:'teacher@school.test',token:url.searchParams.get('resetToken'),senha:'newpassword'}).ok,true);
assert.equal(invoke('authMe',{sessionToken:teacher.sessionToken}).code,'UNAUTHENTICATED');
assert.equal(invoke('authLogin',{email:'teacher@school.test',senha:'newpassword'}).ok,true);
assert.equal(invoke('enviarSinal',{sessionToken:student.sessionToken,codigoSala:room.sala.codigo,destinatario:teacher.usuario.id,tipo:'offer',payload:JSON.stringify({sdp:'mock'})}).ok,true);
assert.equal(invoke('receberSinal',{sessionToken:teacher.sessionToken}).code,'UNAUTHENTICATED');
const freshTeacher=invoke('authLogin',{email:'teacher@school.test',senha:'newpassword'});
assert.equal(invoke('receberSinal',{sessionToken:freshTeacher.sessionToken}).signals.length,1);
assert.equal(invoke('encerrar',{sessionToken:freshTeacher.sessionToken,codigo:room.sala.codigo}).ok,true);
assert.equal(invoke('entrar',{sessionToken:student.sessionToken,codigo:room.sala.codigo}).code,'ROOM_INACTIVE');
console.log('GAS integration: OK (legacy migration, roles, sessions, rooms, JSON, Drive, reset)');
