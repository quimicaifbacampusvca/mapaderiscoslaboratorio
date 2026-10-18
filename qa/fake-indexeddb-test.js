/* Simulador IDB somente para Playwright — NÃO distribuir como dependência da aplicação. */
(()=>{
 class FakeTransaction{
  constructor(db){this.db=db;this.pending=0;this.completeScheduled=false;this.aborted=false;}
  objectStore(name){return this.db.store(name,this);}
  issue(fn){const r={result:undefined,error:null};this.pending++;
   queueMicrotask(()=>{try{r.result=fn();r.onsuccess?.();}catch(e){r.error=e;this.onerror?.();}
    this.pending--;if(this.pending===0&&!this.completeScheduled){this.completeScheduled=true;queueMicrotask(()=>{if(this.pending===0&&!this.aborted)this.oncomplete?.();else this.completeScheduled=false;});}
   });return r;
  }
  abort(){this.aborted=true;this.onabort?.();}
 }
 class FakeDatabase{
  constructor(){this.data=new Map();this.objectStoreNames={contains:k=>this.data.has(k)};this.autoId=0;}
  createObjectStore(name){this.data.set(name,new Map());return{createIndex(){}};}
  transaction(){return new FakeTransaction(this);}
  store(name,tx){const data=this.data.get(name);return{
   get:k=>tx.issue(()=>structuredClone(data.get(k))),put:v=>tx.issue(()=>{data.set(v.key??v.id,structuredClone(v));return v.key??v.id;}),
   add:v=>tx.issue(()=>{const key=++this.autoId;data.set(key,structuredClone({...v,key}));return key;}),
   delete:k=>tx.issue(()=>data.delete(k)),getAll:()=>tx.issue(()=>structuredClone([...data.values()])),
   index:()=>({getAll:range=>tx.issue(()=>structuredClone([...data.values()].filter(x=>x.projectId===range.value))),
    openCursor:(range,direction)=>{const req={result:null};let rows=null,pos=0;
      const next=()=>{const r=tx.issue(()=>{if(rows===null)rows=[...data.entries()].filter(([,v])=>v.projectId===range.value).sort((a,b)=>direction==='prev'?b[0]-a[0]:a[0]-b[0]);const current=rows[pos++];if(!current)return null;
        return{key:current[0],value:current[1],delete:()=>{tx.issue(()=>data.delete(current[0]));},continue:next};});
       r.onsuccess=()=>{req.result=r.result;req.onsuccess?.();};};next();return req;}
   })
  };}
 }
 const db=new FakeDatabase();
 Object.defineProperty(window,'indexedDB',{configurable:true,value:{open:()=>{const req={result:db};queueMicrotask(()=>{req.onupgradeneeded?.();queueMicrotask(()=>req.onsuccess?.());});return req;}}});
 window.IDBKeyRange={only:value=>({value})};
})();
