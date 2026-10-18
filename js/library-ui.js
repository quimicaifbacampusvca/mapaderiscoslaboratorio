/* UIUX-0.8.3 — Gerenciamento da biblioteca local, sem login e sem rede. */
(() => {
'use strict';
const store = window.MapaProjectLibrary;
const runtime = window.MAPA_RUNTIME;
if (!store || !runtime) return;
const $ = id => document.getElementById(id);
const CURRENT_KEY = 'mapa_riscos_library_active_id';
let currentId = null, queue = Promise.resolve(), ready = null, returnFocus = null, busy = false;
let pendingDeletion = null, libraryErrorShown = false;
const inform = (msg,type='info') => runtime.toast?.(msg,type);
const label = text => {const e=$('libraryStatus');if(e)e.textContent=text;};
const titleFor = payload => payload?.areas?.length === 1 ? payload.areas[0].nome || 'Laboratório' : `Mapa com ${payload?.areas?.length||1} áreas`;
const localRead=key=>{try{return localStorage.getItem(key);}catch(_){return null;}};
const localWrite=(key,val)=>{try{localStorage.setItem(key,val);return true;}catch(_){return false;}};
const getId=()=>currentId;
const saveCaptured=(id,payload,name,{revision=false}={})=>{
  if(!id || !payload)return Promise.resolve();
  queue=queue.catch(()=>{}).then(async()=>{await ensureReady();return store.save({id,payload,name:name||titleFor(payload),revision});});
  return queue.then(value=>{libraryErrorShown=false;return value;},error=>{console.warn('Falha na biblioteca',error);if(!libraryErrorShown){libraryErrorShown=true;inform('Biblioteca local indisponível. Seu autosave continua preservado; baixe o JSON como backup.','error');}throw error;});
};
async function ensureReady(){return ready;}
function migrate(){
  try {
    const old=localRead('mapa_riscos_autosave'),previous=localRead('mapa_riscos_previous_autosave');
    currentId=localRead(CURRENT_KEY)||store.uid();
    const items=[{id:currentId,name:'Projeto recuperado',raw:old}];
    if(previous)items.push({id:store.uid(),name:'Cópia anterior (legado)',raw:previous});
    return store.migrateLegacy(items).then(async result=>{
      if(result.migrated && result.items.length){
        // Se o autosave principal estava ilegível, preservar o atual como projeto novo.
        if(!result.items.includes(currentId)) currentId=store.uid();
      }
      localWrite(CURRENT_KEY,currentId);
      return true;
    });
  } catch(e) {return Promise.reject(e);}
}
ready=migrate().catch(e=>{console.warn('Biblioteca indisponível',e);label('Não foi possível acessar o IndexedDB. O autosave e a exportação JSON continuam disponíveis.');return false;});
// Cada gravação captura seu ID e snapshot ANTES de enfileirar: alterações em outro projeto não sobrescrevem o anterior.
window.addEventListener('mapa:autosaved',event=>{
  const captured=event.detail?.payload;
  if(!currentId)currentId=store.uid();
  saveCaptured(currentId,captured,titleFor(captured)).catch(()=>{});
});
window.addEventListener('mapa:project-replaced',event=>{
  const info=event.detail||{},oldId=currentId;
  // A cópia anterior fica na biblioteca, inclusive quando o autosave local é substituído.
  if(oldId && info.previousRaw){
    try{saveCaptured(oldId,JSON.parse(info.previousRaw),titleFor(JSON.parse(info.previousRaw)),{revision:true}).catch(()=>{});}catch(_){/* legado inválido intacto */}
  }
  currentId=info.targetLibraryId || store.uid();
  localWrite(CURRENT_KEY,currentId);
  saveCaptured(currentId,info.nextPayload,titleFor(info.nextPayload)).catch(()=>{});
});
function node(tag,textValue,cls){const el=document.createElement(tag);if(textValue!==undefined)el.textContent=textValue;if(cls)el.className=cls;return el;}
function button(title,handler,kind){const b=node('button',title,kind||'');b.type='button';b.addEventListener('click',handler);return b;}
function dateText(value){if(!value)return 'Sem data';const date=new Date(value);return Number.isFinite(date.valueOf())?date.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'Sem data';}
async function refresh(){
  const list=$('libraryList');if(!list)return;
  list.replaceChildren();label('Carregando projetos…');
  try{
    await ready;await queue.catch(()=>{});
    const projects=await store.list();
    label(`${projects.length} projeto(s) no armazenamento deste navegador.`);
    if(!projects.length){list.append(node('p','Nenhum mapa na biblioteca. Comece um projeto e ele será guardado automaticamente.','library-empty'));return;}
    for(const item of projects){
      const row=node('article',undefined,'library-item');row.dataset.projectId=item.id;
      const info=node('div',undefined,'library-item-info');
      info.append(node('strong',item.name),node('small',`${item.areas} área(s) · Atualizado ${dateText(item.updatedAt)}${item.id===currentId?' · Projeto ativo':''}`));
      const actions=node('div',undefined,'library-actions');
      actions.append(button('Abrir',()=>openItem(item.id),'library-primary'));
      actions.append(button('Renomear',()=>renameItem(item)));
      actions.append(button('Revisões',()=>showRevisions(item.id,row)));
      if(item.id!==currentId) actions.append(button(pendingDeletion===item.id?'Confirmar exclusão':'Excluir',()=>removeItem(item.id)));
      row.append(info,actions);list.append(row);
    }
  }catch(e){console.warn(e);label('Não foi possível ler a biblioteca. Projetos locais e backups JSON existentes não foram apagados.');}
}
function openModal(){
  const modal=$('libraryModal');if(!modal)return;
  returnFocus=document.activeElement;
  modal.classList.remove('hidden');
  $('homeScreen').inert=true;$('app').inert=true;
  document.body.classList.add('library-open');
  $('libraryClose')?.focus({preventScroll:true});refresh();
}
function closeModal(){
  const modal=$('libraryModal');if(!modal)return;
  modal.classList.add('hidden');
  $('homeScreen').inert=false;$('app').inert=false;
  document.body.classList.remove('library-open');
  if(returnFocus?.isConnected&&!returnFocus.closest('.hidden'))returnFocus.focus({preventScroll:true});
}
async function openItem(id,revisionKey=null){
  if(busy)return;busy=true;
  try{
    await ready;
    // Esperar gravações pendentes evita importar uma versão antiga do projeto recém-modificado.
    await queue;
    const record=await store.load(id);
    const selected=revisionKey===null?record?.payload:(await store.loadRevision(revisionKey))?.payload;
    if(!record||!selected){inform('O projeto selecionado não está disponível.','error');return;}
    store.validate(selected);
    closeModal();
    // Confirmação preserva rascunho anterior; abertura só muda após aceitar.
    runtime.confirmReplacement(`Abrir “${record.name}” substituirá o mapa aberto. Você poderá cancelar ou baixar o JSON anterior.`,()=>{
      try{
        if(!runtime.openLibraryPayload(selected,id))throw Error('Não foi possível abrir projeto');
        if(revisionKey!==null)inform('Revisão recuperada. O estado anterior foi guardado em revisões.','success');
      }catch(err){console.error(err);inform('Falha ao abrir mapa. O projeto atual foi preservado.','error');}
    });
  }catch(e){console.warn(e);inform('Falha ao abrir projeto da biblioteca.','error');}finally{busy=false;}
}
function renameItem(item){
  const cards=[...document.querySelectorAll('.library-item')];
  const card=cards.find(el=>el.dataset.projectId===item.id);
  if(!card)return;
  card.querySelector('.library-rename-form')?.remove();
  const form=node('form',undefined,'library-rename-form');
  const input=node('input');input.value=item.name;input.maxLength=90;input.setAttribute('aria-label',`Novo nome de ${item.name}`);
  const save=button('Salvar nome',()=>{}),cancel=button('Cancelar',()=>form.remove());
  save.type='submit';
  form.append(input,save,cancel);
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!input.value.trim()){inform('Informe um nome para o projeto.','error');return;}
    save.disabled=true;
    try{await queue;await store.rename(item.id,input.value);inform('Projeto renomeado na biblioteca.','success');await refresh();}
    catch(e){console.warn(e);inform('Não foi possível renomear o projeto.','error');save.disabled=false;}
  });
  card.append(form);input.focus();input.select();
}
async function removeItem(id){
  if(pendingDeletion!==id){pendingDeletion=id;label('Confirme a exclusão clicando novamente em “Confirmar exclusão”.');await refresh();return;}
  pendingDeletion=null;
  try{await queue;await store.remove(id);inform('Projeto excluído da biblioteca.','info');await refresh();}
  catch(e){console.warn(e);inform('Não foi possível excluir este projeto.','error');}
}
async function showRevisions(id,row){
  const prior=row.querySelector('.library-revisions');if(prior){prior.remove();return;}
  const wrap=node('div',undefined,'library-revisions');wrap.append(node('strong','Revisões disponíveis'));
  try{
    const items=await store.revisions(id);
    if(!items.length)wrap.append(node('span','Nenhuma revisão explícita. Use “Guardar revisão” no editor.'));
    items.forEach(r=>wrap.append(button(`Restaurar · ${dateText(r.savedAt)}`,()=>openItem(id,r.key))));
  }catch(e){wrap.append(node('span','Não foi possível carregar as revisões.'));}
  row.append(wrap);
}
async function saveCurrent({revision=false}={}){
  try{
    await ready;
    if(!runtime.persist())return;
    const payload=runtime.snapshot();
    await saveCaptured(currentId,payload,titleFor(payload),{revision});
    inform(revision?'Revisão guardada na biblioteca.':'Projeto guardado na biblioteca.','success');
    if(!$('libraryModal').classList.contains('hidden'))await refresh();
  }catch(e){console.warn(e);inform('Não foi possível guardar no IndexedDB. Baixe seu JSON antes de sair.','error');}
}
$('homeLibrary')?.addEventListener('click',openModal);
$('libraryClose')?.addEventListener('click',closeModal);
$('libraryCloseFooter')?.addEventListener('click',closeModal);
$('libraryModal')?.addEventListener('click',e=>{if(e.target.id==='libraryModal')closeModal();});
$('librarySaveCurrent')?.addEventListener('click',()=>saveCurrent({revision:true}));
$('librarySaveRevision')?.addEventListener('click',()=>saveCurrent({revision:true}));
document.addEventListener('keydown',event=>{
  const modal=$('libraryModal');if(!modal||modal.classList.contains('hidden'))return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeModal();return;}
  if(event.key!=='Tab')return;
  const elements=[...modal.querySelectorAll('button:not([disabled]),input:not([disabled])')].filter(x=>x.offsetParent!==null);
  if(!elements.length)return;
  const first=elements[0],last=elements.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
},true);
window.MAPA_LIBRARY_RUNTIME={get currentId(){return currentId;},refresh,saveCurrent,openItem};
})();
