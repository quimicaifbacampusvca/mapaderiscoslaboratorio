/* UIUX-0.8.3 — IndexedDB transacional. Nunca apaga os autosaves legados. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(root)root.MapaProjectLibrary=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const NAME='mapa-riscos-library', VERSION=1, MAX_REVISIONS=10;
function uid(){return typeof crypto!=='undefined' && crypto.randomUUID?crypto.randomUUID():`mapa-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
function cleanName(v){return String(v||'Projeto sem título').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,90)||'Projeto sem título';}
function validate(raw){
  let v=typeof raw==='string'?JSON.parse(raw):raw;
  if(v && !Array.isArray(v.areas) && v.room && Array.isArray(v.objects)){
    const a={id:'legacy-area',nome:'Laboratório',tipo:'laboratorio',dimensoes:v.room,posicaoGlobal:{x:0,y:0},objetos:v.objects};
    v={version:4,date:v.date||new Date().toISOString(),areas:[a],areaAtiva:a.id};
  }
  if(!v||typeof v!=='object'||!Array.isArray(v.areas)||v.areas.length<1||v.areas.length>200)throw Error('Projeto sem áreas válidas');
  for(const a of v.areas){const w=Number(a?.dimensoes?.w),h=Number(a?.dimensoes?.h);if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0||w>10000||h>10000||!Array.isArray(a.objetos||[]))throw Error('Dimensões ou objetos inválidos');}
  // JSON v4 puro, sem IDs da biblioteca embutidos no arquivo de projeto.
  return JSON.parse(JSON.stringify(v));
}
function connect(){
  return new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined')return reject(Error('IndexedDB indisponível'));
    const req=indexedDB.open(NAME,VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains('projects'))db.createObjectStore('projects',{keyPath:'id'});
      if(!db.objectStoreNames.contains('revisions')){const s=db.createObjectStore('revisions',{keyPath:'key',autoIncrement:true});s.createIndex('projectId','projectId',{unique:false});}
      if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta',{keyPath:'key'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||Error('Falha ao abrir biblioteca'));
    req.onblocked=()=>reject(Error('Feche outras abas da aplicação e tente novamente'));
  });
}
let dbPromise=null;
function open(){return dbPromise||(dbPromise=connect().catch(e=>{dbPromise=null;throw e;}));}
async function transaction(stores,mode,fn){
  const db=await open();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(stores,mode);let result;
    tx.oncomplete=()=>resolve(result);
    tx.onerror=()=>reject(tx.error||Error('Erro de transação IndexedDB'));
    tx.onabort=()=>reject(tx.error||Error('Transação IndexedDB cancelada'));
    try{fn(tx,v=>{result=v;});}catch(e){tx.abort();reject(e);}
  });
}
function migrateLegacy(entries){
  const valid=[];
  for(const item of entries||[]){
    if(!item||!item.raw)continue;
    try{valid.push({id:item.id||uid(),name:cleanName(item.name),payload:validate(item.raw)});}catch(e){/* preservar conteúdo inválido no armazenamento original */}
  }
  return transaction(['projects','meta'],'readwrite',(tx,done)=>{
    const flag=tx.objectStore('meta').get('legacy-migrated');
    flag.onsuccess=()=>{
      if(flag.result){done({migrated:false,items:[]});return;}
      const now=new Date().toISOString();
      const projects=tx.objectStore('projects');
      for(const p of valid)projects.put({...p,createdAt:now,updatedAt:now});
      tx.objectStore('meta').put({key:'legacy-migrated',completedAt:now,count:valid.length});
      done({migrated:true,items:valid.map(p=>p.id)});
    };
  });
}
function save({id,name,payload,revision=false}){
  const v=validate(payload),key=id||uid(), title=cleanName(name),now=new Date().toISOString();
  return transaction(['projects','revisions'],'readwrite',(tx,done)=>{
    const projects=tx.objectStore('projects');const req=projects.get(key);
    req.onsuccess=()=>{
      const old=req.result;
      projects.put({id:key,name:old?.name||title,createdAt:old?.createdAt||now,updatedAt:now,payload:v});
      if(revision){
        const revisions=tx.objectStore('revisions');
        revisions.add({projectId:key,savedAt:now,payload:v});
        const index=revisions.index('projectId');const cursor=index.openCursor(IDBKeyRange.only(key),'prev');let count=0;
        cursor.onsuccess=()=>{const current=cursor.result;if(!current)return;count++;if(count>MAX_REVISIONS)current.delete();current.continue();};
      }
      done(key);
    };
  });
}
function list(){return transaction(['projects'],'readonly',(tx,done)=>{
  const req=tx.objectStore('projects').getAll();
  req.onsuccess=()=>done(req.result.map(({id,name,createdAt,updatedAt,payload})=>({id,name,createdAt,updatedAt,areas:payload?.areas?.length||0})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)));
});}
function load(id){return transaction(['projects'],'readonly',(tx,done)=>{
  const req=tx.objectStore('projects').get(id);req.onsuccess=()=>done(req.result||null);
});}
function rename(id,name){const title=cleanName(name);return transaction(['projects'],'readwrite',(tx,done)=>{
  const store=tx.objectStore('projects'),req=store.get(id);req.onsuccess=()=>{if(!req.result){tx.abort();return;}
  store.put({...req.result,name:title});done(true);};
});}
function remove(id){return transaction(['projects','revisions'],'readwrite',(tx,done)=>{
  tx.objectStore('projects').delete(id);
  const req=tx.objectStore('revisions').index('projectId').openCursor(IDBKeyRange.only(id));
  req.onsuccess=()=>{const c=req.result;if(c){c.delete();c.continue();}};done(true);
});}
function revisions(id){return transaction(['revisions'],'readonly',(tx,done)=>{
  const req=tx.objectStore('revisions').index('projectId').getAll(IDBKeyRange.only(id));
  req.onsuccess=()=>done(req.result.sort((a,b)=>b.key-a.key).map(({key,projectId,savedAt})=>({key,projectId,savedAt})));
});}
function loadRevision(key){return transaction(['revisions'],'readonly',(tx,done)=>{
  const req=tx.objectStore('revisions').get(key);req.onsuccess=()=>done(req.result||null);
});}
return {NAME,VERSION,MAX_REVISIONS,uid,validate,open,migrateLegacy,save,list,load,rename,remove,revisions,loadRevision};
});
