import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
// Simulação determinística da API IDB: transações, requisições, índice, cursor e commit.
class FakeTransaction {
  constructor(db){this.db=db;this.pending=0;this.completeScheduled=false;this.aborted=false;}
  objectStore(name){return this.db.store(name,this);}
  issue(fn){const r={result:undefined,error:null};this.pending++;
    queueMicrotask(()=>{
      try{r.result=fn();r.onsuccess?.();}
      catch(e){r.error=e;this.onerror?.();}
      this.pending--;
      if(this.pending===0&&!this.completeScheduled){this.completeScheduled=true;queueMicrotask(()=>{
        if(this.pending===0&&!this.aborted)this.oncomplete?.();else this.completeScheduled=false;
      });}
    });return r;
  }
  abort(){this.aborted=true;this.onabort?.();}
}
class FakeDatabase {
  constructor(){this.data=new Map();this.objectStoreNames={contains:k=>this.data.has(k)};this.autoId=0;}
  createObjectStore(name){this.data.set(name,new Map());return {createIndex(){}};}
  transaction(){return new FakeTransaction(this);}
  store(name,tx){const data=this.data.get(name);
    const api={
      get:k=>tx.issue(()=>structuredClone(data.get(k))),
      put:v=>tx.issue(()=>{data.set(v.key??v.id,structuredClone(v));return v.key??v.id;}),
      add:v=>tx.issue(()=>{const key=++this.autoId;data.set(key,structuredClone({...v,key}));return key;}),
      delete:k=>tx.issue(()=>data.delete(k)),
      getAll:()=>tx.issue(()=>structuredClone([...data.values()])),
      createIndex:()=>{},
      index:(indexName)=>({
        getAll:(range)=>tx.issue(()=>structuredClone([...data.values()].filter(x=>x.projectId===range.value))),
        openCursor:(range,direction)=>{
          const req={result:null};
          let rows=null,pos=0;
          const next=()=>{
            const response=tx.issue(()=>{
              if(rows===null)rows=[...data.entries()].filter(([,v])=>v.projectId===range.value).sort((a,b)=>direction==='prev'?b[0]-a[0]:a[0]-b[0]);
              const current=rows[pos++];
              if(!current)return null;
              return {key:current[0],value:current[1],delete:()=>{tx.issue(()=>data.delete(current[0]));},continue:next};
            });
            response.onsuccess=()=>{req.result=response.result;req.onsuccess?.();};
          };
          next();return req;
        }
      })
    };return api;
  }
}
const db=new FakeDatabase();
globalThis.indexedDB={open:()=>{
  const req={result:db};
  queueMicrotask(()=>{req.onupgradeneeded?.();queueMicrotask(()=>req.onsuccess?.());});
  return req;
}};
globalThis.IDBKeyRange={only:value=>({value})};
const lib=require(join(dirname(fileURLToPath(import.meta.url)),'../js/project-library.js'));
const project=(width=12)=>({version:4,date:new Date().toISOString(),areas:[{id:'area1',nome:'Laboratório',tipo:'laboratorio',dimensoes:{w:width,h:8},posicaoGlobal:{x:0,y:0},objetos:[]}],areaAtiva:'area1'});
const old=JSON.stringify(project(12)),previous=JSON.stringify(project(9));
assert.throws(()=>lib.validate({areas:[]}),/áreas/);
const oldFormat={room:{w:7,h:9},objects:[],date:'2026-10-18T12:00:00.000Z'};
assert.equal(lib.validate(oldFormat).areas[0].dimensoes.w,7);
assert.ok(!('areas' in oldFormat),'Migração jamais altera JSON legado em memória');
const migrated=await lib.migrateLegacy([{id:'first',name:'Mapa migrado',raw:old},{id:'previous',name:'Cópia anterior',raw:previous},{id:'invalid',raw:'not json'}]);
assert.deepEqual(migrated.items,['first','previous']);
assert.equal((await lib.list()).length,2);
assert.equal((await lib.load('first')).payload.areas[0].dimensoes.w,12);
assert.equal((await lib.migrateLegacy([{id:'duplicate',raw:old}])).migrated,false);
assert.equal((await lib.list()).length,2,'A migração deve ser idempotente');
for(let i=0;i<13;i++)await lib.save({id:'first',name:'ignorar título atual',payload:project(12+i),revision:true});
const latest=await lib.load('first');
assert.equal(latest.name,'Mapa migrado','Autosave não altera nome personalizado');
assert.equal(latest.payload.areas[0].dimensoes.w,24);
const versions=await lib.revisions('first');
assert.equal(versions.length,10,'O limite de dez revisões deve ser observado');
assert.equal((await lib.loadRevision(versions[0].key)).payload.areas[0].dimensoes.w,24);
assert.equal((await lib.loadRevision(versions.at(-1).key)).payload.areas[0].dimensoes.w,15);
await lib.rename('first','  Meu Laboratório  ');
assert.equal((await lib.load('first')).name,'Meu Laboratório');
await lib.save({id:'third',name:'Novo mapa',payload:project(18)});
assert.equal((await lib.list()).length,3);
await lib.remove('first');
assert.equal(await lib.load('first'),null);
assert.equal((await lib.revisions('first')).length,0);
assert.equal((await lib.list()).length,2);
assert.ok(lib.validate(old).areas[0].dimensoes.w===12);
const html=readFileSync(join(dirname(fileURLToPath(import.meta.url)),'../index.html'),'utf8');
const js=readFileSync(join(dirname(fileURLToPath(import.meta.url)),'../js/mapa.js'),'utf8');
assert.match(html,/id="homeLibrary"/);assert.match(html,/id="libraryModal"/);
assert.match(html,/src="js\/project-library.js"/);assert.match(html,/src="js\/library-ui.js"/);
assert.match(js,/mapa:autosaved/);assert.match(js,/mapa:project-replaced/);
console.log('UIUX-0.8.3 — IndexedDB simulado: migração idempotente, projetos, 10 revisões, exclusão e JSON v4: OK');
