/**
 * SILM? Não: MRL C01/E03 — matriz responsiva e de acessibilidade.
 * Verifica UI real em 5 viewports × 2 perfis, Chromium/Firefox/WebKit.
 * Não afirma homologação de leitores de tela ou dispositivos físicos.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium,firefox,webkit} from 'playwright';

const browserName=process.argv[2]||'chromium';
const browserType={chromium,firefox,webkit}[browserName];
if(!browserType)throw Error('Browser inválido: '+browserName);
const url=process.env.MRL_TEST_URL||'http://127.0.0.1:8765/';
const out='qa/browser-artifacts';
await fs.mkdir(out,{recursive:true});
const browser=await browserType.launch({headless:true});
const failures=[];
const dimensions=[[320,568],[390,844],[768,1024],[1024,768],[1440,900]];
const check=(condition,msg)=>assert.ok(condition,msg);
async function geometry(page,selector,{withinViewport=true}={}){
  const item=page.locator(selector);
  await item.waitFor({state:'visible',timeout:10000});
  const value=await item.evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,
      scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,viewportW:innerWidth,viewportH:innerHeight};
  });
  check(value.width>0&&value.height>0,'Elemento sem dimensão: '+selector);
  if(withinViewport)check(value.left>=-4&&value.right<=value.viewportW+4,
    'Componente fora da largura visível '+selector+' '+JSON.stringify(value));
  return value;
}
async function globalWidth(page,label){
  const info=await page.evaluate(()=>({
    vp:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,
    font:window.MRLAccessibility?.getPreferences().font
  }));
  check(info.doc<=info.vp+4,'Rolagem horizontal em '+label+': '+JSON.stringify(info));
}
async function openLeft(page){
  const b=page.locator('#btnToggleTools');
  if(await b.isVisible() && await b.getAttribute('aria-expanded')!=='true')await b.click();
}
async function closeLeft(page){
  const b=page.locator('#btnToggleTools');
  if(await b.isVisible() && await b.getAttribute('aria-expanded')==='true')
    await page.locator('#closeToolsPanel').click();
}
async function openRight(page){
  const b=page.locator('#btnToggleProps');
  if(await b.isVisible() && await b.getAttribute('aria-expanded')!=='true')await b.click();
}
async function closeRight(page){
  const b=page.locator('#btnToggleProps');
  if(await b.isVisible() && await b.getAttribute('aria-expanded')==='true')
    await page.locator('#closePropsPanel').click();
}
async function openA11y(page){
  await page.locator('#editorSettingsBtn').click();
  await geometry(page,'#settingsPanel');
  if(!(await page.locator('#mrlA11yDetails').evaluate(el=>el.open)))
    await page.locator('#mrlA11ySummary').click();
}
async function setExtreme(page){
  await page.locator('#mrlA11yDark').uncheck();
  await page.locator('#mrlA11yContrast').check();
  await page.locator('#mrlA11yReading').check();
  await page.locator('#mrlA11ySpacing').check();
  await page.locator('#mrlA11yMotion').check();
  await page.locator('#mrlA11yCvd').selectOption('protanopia');
  for(let i=0;i<10;i++)await page.locator('#mrlFontPlus').click();
  const prefs=await page.evaluate(()=>window.MRLAccessibility.getPreferences());
  assert.equal(prefs.font,200);
  assert.equal(prefs.dark,false);
  assert.equal(prefs.contrast,true);
  assert.equal(prefs.reading,true);
  assert.equal(prefs.cvd,'protanopia');
}
async function modalScreenshot(page,width,label){
  await page.screenshot({path:out+'/'+browserName+'-MATRIX-'+width+'-'+label+'.png',fullPage:true});
}
async function one(width,height){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,acceptDownloads:true});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const label=width+'x'+height;
  try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await globalWidth(page,label+' home default');
    await page.locator('#homeNewProject').click();
    await page.locator('#app').waitFor({state:'visible',timeout:15000});
    await openLeft(page);
    for(const type of ['bench','hood','door','extinguisher','chemical','biological','physical','electrical'])
      await page.locator('.palette button[data-type="'+type+'"]').click();
    check((await page.evaluate(()=>window.MAPA_RUNTIME.state.objects.length))===8,'Oito objetos não adicionados em '+label);
    await closeLeft(page);
    const baseline=await page.evaluate(()=>JSON.stringify(window.MAPA_RUNTIME.state.areas.map(a=>({
      id:a.id,tipo:a.tipo,dimensoes:a.dimensoes,objetos:a.objetos
    }))));
    for(const profile of ['padrao','extremo']){
      if(profile==='extremo'){
        await closeRight(page);
        await openA11y(page);
        await setExtreme(page);
        if(width<=390) {
          const debug=await page.evaluate(()=>{
            const panel=document.getElementById('settingsPanel'),summary=document.getElementById('mrlA11ySummary');
            const p=panel.getBoundingClientRect(),s=summary.getBoundingClientRect(),style=getComputedStyle(panel);
            return {panel:{x:p.x,y:p.y,width:p.width,height:p.height,top:p.top,right:p.right},summary:{x:s.x,y:s.y,width:s.width},
              style:{position:style.position,left:style.left,right:style.right,top:style.top,bottom:style.bottom,
                transform:style.transform,margin:style.margin,translate:style.translate,width:style.width},
              window:{innerWidth,innerHeight,scrollX,scrollY,visualX:visualViewport?.offsetLeft,
                docScrollX:document.documentElement.scrollLeft,bodyScrollX:document.body.scrollLeft}};
          });
          console.log('DIAG '+browserName+' '+label+' '+JSON.stringify(debug));
        }
        await geometry(page,'#mrlA11ySummary');
        await page.locator('#mrlA11yReset').scrollIntoViewIfNeeded();
        // Esse botão deve ser alcançável pelo conteúdo rolável do diálogo.
        const bottom=await geometry(page,'#mrlA11yReset');
        const dialog=await geometry(page,'#settingsPanel');
        check(bottom.top>=dialog.top-3&&bottom.bottom<=dialog.bottom+3,
          'Controles inferiores da acessibilidade inalcançáveis em '+label);
        if(width===320||width===768)await modalScreenshot(page,width,'acessibilidade-200');
        await page.locator('#settingsClose').click();
        await page.locator('#settingsPanel').waitFor({state:'hidden'});
      }
      await globalWidth(page,label+' '+profile+' editor');
      await openRight(page);
      await page.locator('#panelTab-layers').click();
      check(/8 itens/.test(await page.locator('#totalObjectsBadge').innerText()),'Contador de camadas incorreto '+label);
      await geometry(page,'#rightPanel');
      await geometry(page,'#totalObjectsBadge',{withinViewport:false});
      await page.locator('#panelTab-report').click();
      await geometry(page,'#compliance-badge',{withinViewport:false});
      await page.locator('#openComplianceReport').click();
      await geometry(page,'#complianceReportModal');
      await geometry(page,'#complianceReportModal .modal-card');
      await geometry(page,'#btnCloseComplianceReport');
      check(/Áreas/.test(await page.locator('#reportSummary').innerText()),'Faltou resumo do relatório '+label);
      await modalScreenshot(page,width,profile+'-relatorio');
      await page.keyboard.press('Escape');
      await page.locator('#complianceReportModal').waitFor({state:'hidden'});
      await closeRight(page);
      await openLeft(page);
      await page.locator('#openModels').click();
      await geometry(page,'#modelsModal');
      await geometry(page,'#modelsModal .modal-card');
      await geometry(page,'#closeModels');
      check((await page.locator('#modelsGrid .model-card').count())>0,'Catálogo vazio');
      if(profile==='extremo')await modalScreenshot(page,width,profile+'-modelos');
      await page.keyboard.press('Escape');
      await page.locator('#modelsModal').waitFor({state:'hidden'});
      await closeLeft(page);
      const unchanged=await page.evaluate(()=>JSON.stringify(window.MAPA_RUNTIME.state.areas.map(a=>({
        id:a.id,tipo:a.tipo,dimensoes:a.dimensoes,objetos:a.objetos
      }))));
      assert.equal(unchanged,baseline,'Aparência/diálogos alteraram estado do projeto '+label);
      await globalWidth(page,label+' '+profile+' fechamento');
      console.log('OK '+browserName+' — '+label+' '+profile+' (camadas, modelos, relatório, largura, dados íntegros)');
    }
    if(errors.length)throw Error('Exceções browser: '+errors.join(' | '));
  }catch(error){
    failures.push(label+': '+error.stack);
    await page.screenshot({path:out+'/'+browserName+'-MATRIX-'+width+'-ERRO.png',fullPage:true}).catch(()=>{});
  }finally{await context.close();}
}
try{
  for(const [w,h] of dimensions)await one(w,h);
}finally{await browser.close();}
if(failures.length){for(const x of failures)console.error('FALHA '+browserName+' '+x);process.exitCode=1;}
else console.log('MRL matriz responsiva '+browserName+': APROVADA ('+(dimensions.length*2)+' combinações)');
