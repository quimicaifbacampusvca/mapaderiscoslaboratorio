/**
 * Homologação funcional automatizada complementar C01/E03 — H01–H07/H09/H10.
 * H08 é coberto por c01-e03-a11y-browser.mjs. Não equivale à inspeção manual.
 * Dados são criados em contexts descartáveis; nenhum dado real é lido.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium,firefox,webkit} from 'playwright';

const name=process.argv[2]||'chromium';
const engine={chromium,firefox,webkit}[name];
if(!engine)throw new Error('Browser inválido: '+name);
const url=process.env.MRL_TEST_URL||'http://127.0.0.1:8765/';
const out='qa/browser-artifacts';
await fs.mkdir(out,{recursive:true});
const browser=await engine.launch({headless:true});
const problems=[];
const scenarioResults=[];
function log(s){scenarioResults.push(s);console.log('OK '+name+' — '+s);}
async function state(page){return page.evaluate(()=>({
  active:window.MAPA_RUNTIME.state.areaAtiva,
  areas:window.MAPA_RUNTIME.state.areas.map(a=>({id:a.id,nome:a.nome,tipo:a.tipo,objs:a.objetos.map(o=>({type:o.type,hidden:o.hidden,locked:o.locked}))}))
}));}
async function start(page){
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#homeNewProject').click();
  await page.locator('#app').waitFor({state:'visible'});
  await page.waitForFunction(()=>!!window.MAPA_RUNTIME?.state?.areas);
}
async function add(page,type){await page.locator('.palette button[data-type="'+type+'"]').click();}
async function profile(label,fn){
  const ctx=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await fn(page);
    assert.equal(errors.length,0,'Erros de execução: '+errors.join(' | '));
  }catch(e){
    problems.push(label+': '+e.stack);
    await page.screenshot({path:out+'/'+name+'-'+label+'-erro.png',fullPage:true}).catch(()=>{});
  }finally{await ctx.close();}
}
try{
  await profile('H01-H02',async page=>{
    await start(page);
    await add(page,'bench');
    await page.waitForFunction(()=>{
      try{return JSON.parse(localStorage.getItem('mapa_riscos_autosave')).areas[0].objetos.length===1;}
      catch{return false;}
    },null,{timeout:15000});
    await page.locator('#homeBtn').click();
    assert.ok(await page.locator('#recentProjects').isVisible());
    assert.match(await page.locator('#recentList').innerText(),/Salvo neste navegador/);
    assert.match(await page.locator('#recentList').innerText(),/1 área/);
    log('H01 Home mostra autosave, data e área');
    await page.locator('#homeNewProject').click();
    await page.locator('#confirmModal').waitFor({state:'visible'});
    await page.locator('#cancelConfirm').click();
    await page.locator('#homeContinue').click();
    assert.equal((await state(page)).areas[0].objs.length,1,'Cancelar não pode substituir projeto');
    await page.locator('#homeBtn').click();
    await page.locator('#homeNewProject').click();
    await page.locator('#confirmModal').waitFor({state:'visible'});
    const backupVisible=await page.locator('#confirmBackup').isVisible();
    assert.ok(backupVisible,'Deve haver opção de baixar JSON anterior');
    await page.locator('#confirmAction').click();
    await page.locator('#app').waitFor({state:'visible'});
    assert.equal((await state(page)).areas[0].objs.length,0);
    await page.locator('#homeBtn').click();
    assert.ok(await page.locator('#previousProjectRow').isVisible());
    await page.locator('#homeRestorePrevious').click();
    if(await page.locator('#confirmModal').isVisible())await page.locator('#confirmAction').click();
    await page.waitForFunction(()=>window.MAPA_RUNTIME?.state?.objects?.length===1);
    assert.equal((await state(page)).areas[0].objs[0].type,'bench');
    log('H02 cópia anterior recuperável após confirmação da substituição');
  });

  await profile('H04-H05',async page=>{
    await start(page);
    await add(page,'bench');
    await page.locator('#openModels').click();
    await page.locator('#modelsModal').waitFor({state:'visible'});
    const cards=page.locator('#modelsGrid .model-card');
    assert.ok(await cards.count()>=1,'Catálogo de modelos vazio');
    assert.match(await page.locator('#modelsTitle').innerText(),/Modelos de Laboratório/);
    await page.screenshot({path:out+'/'+name+'-H04-modelos.png',fullPage:true});
    await cards.first().click();
    await page.locator('#confirmModal').waitFor({state:'visible'});
    assert.ok(await page.locator('#confirmBackup').isVisible());
    assert.equal(await page.evaluate(()=>document.activeElement.closest('#confirmModal')!==null),true,
      'Foco fora do diálogo de confirmação');
    await page.keyboard.press('Escape');
    await page.locator('#confirmModal').waitFor({state:'hidden'});
    assert.equal((await state(page)).areas[0].objs.length,1,'Escape descartou mapa');
    assert.ok(await page.locator('#modelsModal').isVisible(),'Fechou modelos junto com confirmação');
    log('H04/H05 modelos e confirmação cancelável, sem perda da planta');
    await page.keyboard.press('Escape');
    await page.locator('#modelsModal').waitFor({state:'hidden'});
    assert.equal((await state(page)).areas[0].objs.length,1);
  });

  await profile('H06-H07-H10',async page=>{
    await start(page);
    for(const type of ['bench','hood','door','extinguisher','chemical','biological','physical','electrical'])
      await add(page,type);
    const current=await state(page);
    assert.equal(current.areas[0].objs.length,8);
    assert.match(await page.locator('#totalObjectsBadge').innerText(),/8 itens/);
    assert.match(await page.locator('#riskList').innerText(),/químico/i);
    assert.match(await page.locator('#riskList').innerText(),/biológico/i);
    const tree=page.locator('#objectsTree');
    assert.ok(await tree.locator('[role="option"],.tree-item').count()>=1);
    await page.screenshot({path:out+'/'+name+'-H06-camadas.png',fullPage:true});
    log('H06 árvore, contador e resumo com 8 objetos e quatro riscos');
    await page.locator('#panelTab-report').click();
    assert.ok(await page.locator('#compliance-badge').isVisible());
    assert.match(await page.locator('#complianceSection').innerText(),/não uma certificação normativa/i);
    await page.locator('#openComplianceReport').click();
    await page.locator('#complianceReportModal').waitFor({state:'visible'});
    assert.match(await page.locator('#reportSummary').innerText(),/Áreas/);
    assert.match(await page.locator('#reportList').innerText(),/Laboratório/);
    await page.screenshot({path:out+'/'+name+'-H07-relatorio.png',fullPage:true});
    await page.keyboard.press('Escape');
    await page.locator('#complianceReportModal').waitFor({state:'hidden'});
    assert.equal((await state(page)).areas[0].objs.length,8);
    log('H07 relatório didático, modal, Escape e preservação dos dados');
    await page.locator('#areaType').selectOption('almoxarifado');
    assert.equal((await state(page)).areas[0].tipo,'almoxarifado');
    await page.locator('#newArea').click();
    const next=await state(page);
    assert.equal(next.areas.length,2);
    await page.locator('#areaSelect').selectOption(next.areas[0].id);
    const first=await state(page);
    assert.equal(first.active,next.areas[0].id);
    assert.equal(await page.locator('#areaType').inputValue(),'almoxarifado');
    log('H10 seletor de tipo e alternância entre duas áreas');
  });

  await profile('H09',async page=>{
    await start(page);
    await add(page,'chemical');
    const initial=JSON.stringify(await state(page));
    const chosen=page.waitForEvent('filechooser');
    await page.locator('#load').click();
    const picker=await chosen;
    await picker.setFiles({name:'invalido.json',mimeType:'application/json',buffer:Buffer.from('{"areas": [{"bad": true}]}')});
    await page.waitForFunction(()=>[...document.querySelectorAll('#toastContainer *')].some(e=>/inválido ou incompatível/i.test(e.textContent)));
    assert.equal(JSON.stringify(await state(page)),initial,'JSON inválido alterou o mapa');
    assert.ok(!(await page.locator('#confirmModal').isVisible()));
    log('H09 importação inválida rejeitada sem modificar projeto');
  });

  await profile('H03',async page=>{
    await start(page);
    await add(page,'bench');
    await page.locator('#librarySaveRevision').click();
    await page.waitForFunction(async()=>{
      try{const id=localStorage.getItem('mapa_riscos_library_active_id');
        return Boolean(id&&await window.MapaProjectLibrary.load(id))}
      catch{return false}
    },null,{timeout:15000});
    await page.locator('#homeBtn').click();
    await page.locator('#homeNewProject').click();
    await page.locator('#confirmModal').waitFor({state:'visible'});
    await page.locator('#confirmAction').click();
    await page.locator('#app').waitFor({state:'visible'});
    await add(page,'chemical');
    await page.locator('#librarySaveRevision').click();
    await page.waitForFunction(async()=>{
      try{const r=await window.MapaProjectLibrary.list();return r.length>=2}
      catch{return false}
    },null,{timeout:15000});
    await page.locator('#homeBtn').click();
    await page.locator('#homeLibrary').click();
    await page.locator('#libraryModal').waitFor({state:'visible'});
    await page.waitForFunction(()=>document.querySelectorAll('#libraryList .library-item').length>=2);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'libraryClose');
    assert.ok(await page.evaluate(()=>document.querySelector('#homeScreen').inert));
    const prior=page.locator('#libraryList .library-item').filter({hasNotText:'Projeto ativo'}).first();
    assert.ok(await prior.isVisible());
    await prior.getByRole('button',{name:'Revisões'}).click();
    assert.ok(await prior.locator('.library-revisions').isVisible());
    assert.ok(await prior.locator('.library-revisions button').count()>=1);
    await prior.getByRole('button',{name:'Renomear'}).click();
    await prior.locator('.library-rename-form input').fill('Mapa H03 de referência');
    await prior.getByRole('button',{name:'Salvar nome'}).click();
    await page.getByText('Mapa H03 de referência').first().waitFor({state:'visible'});
    await page.screenshot({path:out+'/'+name+'-H03-biblioteca.png',fullPage:true});
    const renamed=page.locator('#libraryList .library-item').filter({hasText:'Mapa H03 de referência'}).first();
    await renamed.getByRole('button',{name:'Abrir'}).click();
    await page.locator('#confirmModal').waitFor({state:'visible'});
    await page.locator('#cancelConfirm').click();
    assert.equal((await state(page)).areas[0].objs[0].type,'chemical');
    await page.locator('#homeLibrary').click();
    await page.locator('#libraryModal').waitFor({state:'visible'});
    await page.waitForFunction(()=>document.querySelectorAll('#libraryList .library-item').length>=2);
    await page.keyboard.press('Escape');
    await page.locator('#libraryModal').waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>document.activeElement.id),'homeLibrary');
    log('H03 biblioteca de múltiplos projetos, revisões, renomear, cancelar e foco');
  });
}finally{
  await browser.close();
}
if(problems.length){
  for(const p of problems)console.error('FALHA '+name+' — '+p);
  process.exitCode=1;
}else console.log('H01-H07/H09/H10 '+name+': APROVADO ('+scenarioResults.length+' verificações)');
