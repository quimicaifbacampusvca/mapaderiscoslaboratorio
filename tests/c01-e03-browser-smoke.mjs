/**
 * Homologação E2E C01/E03 — navegador real, projeto descartável, sem tocar
 * nos dados do usuário. Execução: node tests/c01-e03-browser-smoke.mjs chromium
 * Requer Playwright instalado e servidor local na porta 8765.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium, firefox, webkit} from 'playwright';

const browserName=process.argv[2]||'chromium';
const browserType={chromium,firefox,webkit}[browserName];
if(!browserType) throw new Error('Navegador desconhecido: '+browserName);
const url=process.env.MRL_TEST_URL||'http://127.0.0.1:8765/';
const out=path.resolve('qa/browser-artifacts');
await fs.mkdir(out,{recursive:true});
const browser=await browserType.launch({headless:true});
const failures=[];
const mark=(label)=>console.log('OK '+browserName+' — '+label);
const errors=[];
const getState=page=>page.evaluate(()=>({
  count:window.MAPA_RUNTIME.state.objects.length,
  objects:window.MAPA_RUNTIME.state.objects.map(o=>({
    type:o.type,hidden:o.hidden,locked:o.locked,rot:o.rot,connectionAreaId:o.connectionAreaId
  }))
}));
function collectErrors(page,label){
  page.on('pageerror',error=>errors.push(label+': '+error.message));
}
async function newEditor(page){
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#homeNewProject').click();
  await page.locator('#app').waitFor({state:'visible',timeout:15000});
  await page.waitForFunction(()=>!!window.MAPA_RUNTIME?.state);
}
async function desktop(){
  const context=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
  const page=await context.newPage();
  collectErrors(page,'desktop');
  try{
    await newEditor(page);
    assert.equal((await getState(page)).count,0);
    assert.ok(await page.locator('#canvas').isVisible());
    mark('abertura e Canvas desktop');

    await page.locator('[data-type="bench"]').click();
    await page.waitForFunction(()=>window.MAPA_RUNTIME.state.objects.length===1);
    assert.match(await page.locator('#totalObjectsBadge').innerText(),/1 itens/);
    await page.locator('#ctxLock').click();
    assert.equal((await getState(page)).objects[0].locked,true);
    await page.locator('#ctxDelete').click();
    await page.locator('#ctxDuplicate').click();
    await page.locator('#ctxRotate').click();
    const afterLocked=await getState(page);
    assert.equal(afterLocked.count,1);
    assert.equal(afterLocked.objects[0].rot,0);
    await page.locator('#ctxLock').click();
    await page.locator('#ctxDuplicate').click();
    assert.equal((await getState(page)).count,2);
    await page.locator('#undo').click();
    assert.equal((await getState(page)).count,1);
    await page.locator('#redo').click();
    assert.equal((await getState(page)).count,2);
    mark('bloqueio, duplicação, exclusão, desfazer e refazer');

    await page.locator('[data-type="chemical"]').click();
    assert.equal((await getState(page)).count,3);
    await page.locator('#ctxHide').click();
    const hiddenRisk=(await getState(page)).objects.find(o=>o.type==='chemical');
    assert.equal(hiddenRisk.hidden,true);
    assert.match(await page.locator('#riskList').innerText(),/Risco químico/i);
    assert.match(await page.locator('#totalObjectsBadge').innerText(),/3 itens/);
    mark('ocultação preserva inventário e resumo dos riscos');

    // O usuário pode guardar uma revisão e recuperá-la sem alterar o JSON v4.
    await page.locator('#librarySaveRevision').click();
    await page.waitForFunction(async()=>{
      try{
        const id=localStorage.getItem('mapa_riscos_library_active_id');
        if(!id || !window.MapaProjectLibrary)return false;
        const [item,versions]=await Promise.all([
          window.MapaProjectLibrary.load(id),
          window.MapaProjectLibrary.revisions(id)
        ]);
        return !!item && item.payload.areas[0].objetos.length===3 && versions.length>=1;
      }catch{return false;}
    },null,{timeout:15000});
    mark('biblioteca IndexedDB e revisão explícita do projeto');

    const [download]=await Promise.all([
      page.waitForEvent('download',{timeout:15000}),
      page.locator('#save').click()
    ]);
    const raw=await fs.readFile(await download.path(),'utf8');
    const json=JSON.parse(raw);
    assert.equal(json.version,4);
    assert.equal(json.areas[0].objetos.length,3);
    assert.ok(json.areas[0].objetos.some(o=>o.type==='chemical'&&o.hidden));
    await page.waitForFunction(()=>{
      try{return JSON.parse(localStorage.getItem('mapa_riscos_autosave')).areas[0].objetos.length===3}
      catch{return false}
    },{timeout:15000});
    mark('download JSON v4 e autosave local');

    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('#homeContinue').click();
    await page.locator('#app').waitFor({state:'visible'});
    const restored=await getState(page);
    assert.equal(restored.count,3);
    assert.ok(restored.objects.some(o=>o.type==='chemical'&&o.hidden));
    mark('reabertura e recuperação do projeto após reload');

    // Criar obstrução por cliques reais da paleta; o mapa conserva bancada ao centro.
    await page.locator('[data-type="door"]').click();
    await page.locator('#panelTab-report').click();
    assert.ok(await page.locator('#check-exit').isVisible());
    assert.equal(await page.locator('#check-exit').evaluate(e=>e.classList.contains('ok')),false);
    assert.match(await page.locator('#complianceSection').innerText(),/não uma certificação normativa/i);
    mark('saída obstruída reprova critério didático, sem alegar laudo');
    await page.screenshot({path:path.join(out,browserName+'-desktop-relatorio.png'),fullPage:true});

    // Importação deve respeitar confirmação: cancelar preserva o projeto, aceitar restaura JSON.
    const importFile=async()=>{
      const chooserPromise=page.waitForEvent('filechooser',{timeout:15000});
      await page.locator('#load').click();
      const chooser=await chooserPromise;
      await chooser.setFiles({name:'projeto-c01-e03.json',mimeType:'application/json',buffer:Buffer.from(raw,'utf8')});
      await page.locator('#confirmModal').waitFor({state:'visible',timeout:15000});
    };
    assert.equal((await getState(page)).count,4);
    await importFile();
    await page.locator('#cancelConfirm').click();
    assert.equal((await getState(page)).count,4,'Cancelar importação preserva os objetos');
    await importFile();
    await page.locator('#confirmAction').click();
    await page.waitForFunction(()=>window.MAPA_RUNTIME.state.objects.length===3);
    assert.equal((await getState(page)).objects.find(o=>o.type==='chemical').hidden,true);
    mark('importação JSON v4 — cancelar e confirmar sem perda de dados');

    if(browserName==='chromium'){
      const sw=await page.evaluate(async()=>{
        if(!('serviceWorker' in navigator))return false;
        await navigator.serviceWorker.ready;
        return true;
      });
      assert.ok(sw,'PWA não registrou Service Worker em localhost');
      await page.reload({waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller));
      await context.setOffline(true);
      await page.reload({waitUntil:'domcontentloaded'});
      assert.ok(await page.locator('#homeNewProject').isVisible());
      assert.ok(await page.evaluate(()=>!navigator.onLine));
      await context.setOffline(false);
      mark('PWA carrega Home em recarga offline (Chromium)');
    }
  }catch(e){
    failures.push('desktop: '+e.stack);
    await page.screenshot({path:path.join(out,browserName+'-desktop-error.png'),fullPage:true}).catch(()=>{});
  }finally{await context.close();}
}
async function mobile(width){
  const context=await browser.newContext({viewport:{width,height:width===320?568:844},deviceScaleFactor:1});
  const page=await context.newPage();
  collectErrors(page,'mobile-'+width);
  try{
    await newEditor(page);
    await page.locator('#btnToggleTools').click();
    assert.equal(await page.locator('#btnToggleTools').getAttribute('aria-expanded'),'true');
    assert.ok(await page.locator('#leftPanel').evaluate(e=>e.classList.contains('mobile-open')));
    await page.locator('[data-type="chemical"]').click();
    assert.equal((await getState(page)).count,1);
    await page.locator('#closeToolsPanel').click();
    assert.equal(await page.locator('#btnToggleTools').getAttribute('aria-expanded'),'false');
    await page.locator('#btnToggleProps').click();
    assert.equal(await page.locator('#btnToggleProps').getAttribute('aria-expanded'),'true');
    await page.locator('#panelTab-layers').click();
    assert.match(await page.locator('#totalObjectsBadge').innerText(),/1 itens/);
    await page.locator('#panelTab-properties').click();
    assert.ok(await page.locator('#x').isVisible());
    await page.locator('#panelTab-report').click();
    assert.ok(await page.locator('#compliance-badge').isVisible());
    const dims=await page.evaluate(()=>({
      scroll:document.documentElement.scrollWidth,viewport:innerWidth,
      rect:document.getElementById('rightPanel').getBoundingClientRect().toJSON()
    }));
    assert.ok(dims.scroll<=dims.viewport+3,
      'Rolagem horizontal inesperada na viewport '+width+': '+JSON.stringify(dims));
    assert.ok(dims.rect.left>=-3 && dims.rect.right<=dims.viewport+3,
      'Drawer direito fora da viewport: '+JSON.stringify(dims));
    await page.screenshot({path:path.join(out,browserName+'-mobile-'+width+'-painel.png'),fullPage:true});
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#btnToggleProps').getAttribute('aria-expanded'),'false');
    mark('painéis, paleta, abas, foco/fechamento e largura '+width+'px');
  }catch(e){
    failures.push('mobile '+width+': '+e.stack);
    await page.screenshot({path:path.join(out,browserName+'-mobile-'+width+'-error.png'),fullPage:true}).catch(()=>{});
  }finally{await context.close();}
}
try{
  await desktop();
  for(const width of [320,390])await mobile(width);
  if(errors.length) failures.push('Erros não tratados no browser:\n'+errors.join('\n'));
}finally{await browser.close();}
if(failures.length){
  failures.forEach(msg=>console.error('FALHA '+browserName+' — '+msg));
  process.exitCode=1;
}else console.log('C01/E03 homologação funcional '+browserName+': APROVADA');
