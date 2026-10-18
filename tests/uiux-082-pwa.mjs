import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {runInNewContext} from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const scope='https://example.github.io/mapaderiscoslaboratorio/';
const manifest=JSON.parse(readFileSync(resolve(root,'manifest.webmanifest'),'utf8'));
assert.equal(manifest.start_url,'./');
assert.equal(manifest.scope,'./');
assert.equal(manifest.display,'standalone');
assert.equal(manifest.icons.length,4);
for(const icon of manifest.icons)assert.ok(existsSync(resolve(root,icon.src)),icon.src);
const html=readFileSync(resolve(root,'index.html'),'utf8');
assert.match(html,/rel="manifest" href="manifest.webmanifest"/);
assert.match(html,/src="js\/pwa\.js"/);
assert.match(html,/id="pwaControls"[^>]*hidden/);
assert.ok(!html.includes('Sem login. O projeto atual é salvo automaticamente'));
const code=readFileSync(resolve(root,'sw.js'),'utf8');
const listeners={};
const db=new Map();
const assetRequests=[];
let failFor=null,networkOnline=false,skipWaitingCalls=0,claimCalls=0;
const pathnameFor=url=>decodeURIComponent(new URL(url).pathname.slice('/mapaderiscoslaboratorio/'.length));
const makeCache=name=>({
  async addAll(urls){
    for(const url of urls){
      assetRequests.push(url);
      if(url===failFor || !existsSync(resolve(root,pathnameFor(url) || 'index.html')))throw new Error('Asset indisponível: '+url);
      // write as we go to ensure error cleanup is explicitly tested.
      db.get(name).set(url,{from:'cache',url});
    }
  },
  async match(url){return db.get(name).get(url) || null;}
});
const caches={
  async open(name){if(!db.has(name))db.set(name,new Map());return makeCache(name);},
  async keys(){return [...db.keys()];},
  async delete(name){return db.delete(name);}
};
const self={
 registration:{scope},location:{origin:new URL(scope).origin},
 clients:{claim:async()=>{claimCalls++;}},
 skipWaiting:()=>{skipWaitingCalls++;},
 addEventListener(type,handler){listeners[type]=handler;}
};
runInNewContext(code,{self,caches,URL,console,fetch:async req=>{
  if(!networkOnline)throw new Error('Rede desligada');
  return {from:'network',url:req.url};
}});
async function lifetime(type,payload={}){
 let wait;const event={...payload,waitUntil(p){wait=p;}};
 listeners[type](event);if(wait)await wait;
}
async function request(url,mode='same-origin',method='GET'){
 let response;const event={request:{url,method,mode},respondWith(p){response=p;}};
 listeners.fetch(event);return response?await response:null;
}
const home=scope;
const paths=[home+'index.html',home+'js/mapa.js',home+'css/mapa.css',home+'assets/icons/icon-512.png'];
// Não interceptar ações remotas, recursos desconhecidos, nem gravações.
assert.equal(await request('https://script.google.com/macros/s/exemplo/exec'),null);
assert.equal(await request(scope+'projeto-pessoal.json'),null);
assert.equal(await request(scope+'js/mapa.js','same-origin','POST'),null);
// Falha ao baixar um recurso obrigatório deve abortar sem ativar um cache parcial.
db.set('mapa-riscos-shell-versao-anterior',new Map([['projeto-intacto',{from:'cache'}]]));
failFor=home+'js/validation.js';
await assert.rejects(lifetime('install'));
assert.equal(db.size,1,'Falha de atualização não pode apagar cache anterior');
assert.ok(db.has('mapa-riscos-shell-versao-anterior'));
failFor=null;
await lifetime('install');
assert.ok(assetRequests.length>=25,'Todos os arquivos locais precisam ser pré-cacheados');
assert.ok([...db.entries()].find(([name]) => name.includes('uiux-0.8.3-v1'))[1].has(home+'manifest.webmanifest'));
await lifetime('activate');
assert.equal(claimCalls,1);
for(const url of paths){const result=await request(url);assert.equal(result?.from,'cache',url);}
assert.equal((await request(scope,'navigate')).from,'cache');
assert.equal((await request(scope+'index.html?ref=offline','navigate')).from,'cache');
assert.equal(await request(scope+'rota-inexistente','navigate'),null);
assert.equal(skipWaitingCalls,0,'Atualização nunca é automática');
// Somente um usuário confirmando ativa a versão aguardando.
listeners.message({data:{type:'OUTRA'}});assert.equal(skipWaitingCalls,0);
listeners.message({data:{type:'SKIP_WAITING'}});assert.equal(skipWaitingCalls,1);
// Remover exclusivamente caches antigos desta aplicação, sem afetar outros PWAs.
db.set('mapa-riscos-shell-versao-antiga',new Map());
db.set('outro-app-shell-v5',new Map());
await lifetime('activate');
assert.equal(db.has('mapa-riscos-shell-versao-antiga'),false);
assert.equal(db.has('outro-app-shell-v5'),true);
// Referência a armazenamento de projetos nunca pode aparecer no SW.
assert.ok(!/localStorage|indexedDB|mapa_riscos_autosave|mapa_riscos_previous_autosave/.test(code));
console.log('UIUX-0.8.2 — contrato PWA, rollback, cache offline e escopo: OK');
