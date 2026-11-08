/**
 * C01/E03 — complemento de homologação H08 de acessibilidade.
 * Playwright em perfis descartáveis, sem alterar dados reais.
 * Requer servidor HTTP em MRL_TEST_URL e pacote Playwright no runner.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium, firefox, webkit} from 'playwright';

const name=process.argv[2] || 'chromium';
const type={chromium,firefox,webkit}[name];
if(!type) throw Error('Navegador desconhecido: '+name);
const address=process.env.MRL_TEST_URL || 'http://127.0.0.1:8765/';
await fs.mkdir('qa/browser-artifacts',{recursive:true});
const browser=await type.launch({headless:true});
const failures=[];
const read=page=>page.evaluate(()=>({
  prefs:window.MRLAccessibility.getPreferences(),
  data:{
    areas:window.MAPA_RUNTIME?.state.areas.map(a=>({
      nome:a.nome,dimensoes:a.dimensoes,
      objetos:a.objetos.map(o=>({id:o.id,type:o.type,x:o.x,y:o.y,w:o.w,h:o.h,rot:o.rot,hidden:o.hidden,locked:o.locked}))
    }))||[]
  },
  dataset: {...document.documentElement.dataset},
  output:document.getElementById('mrlFontOutput')?.textContent,
  viewport:innerWidth,
  documentWidth:document.documentElement.scrollWidth
}));
async function openSettings(page,button){
  await page.locator(button).click();
  await page.locator('#settingsPanel').waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>document.activeElement.id),'settingsClose');
  if(!(await page.locator('#mrlA11yDetails').evaluate(e=>e.open)))
    await page.locator('#mrlA11ySummary').click();
}
async function oneViewport(width,height){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage();
  const runtimeErrors=[];
  page.on('pageerror',e=>runtimeErrors.push(e.message));
  try{
    await page.goto(address,{waitUntil:'domcontentloaded'});
    await openSettings(page,'#homeSettingsBtn');
    await page.locator('#mrlA11yDark').uncheck();
    await page.locator('#mrlA11yContrast').check();
    await page.locator('#mrlA11yReading').check();
    await page.locator('#mrlA11ySpacing').check();
    await page.locator('#mrlA11yMotion').check();
    await page.locator('#mrlA11yCvd').selectOption('deuteranopia');
    for(let n=0;n<10;n++) await page.locator('#mrlFontPlus').click();
    const a=await read(page);
    assert.equal(a.output,'200%');
    assert.equal(a.prefs.font,200);
    assert.equal(a.prefs.dark,false);
    assert.equal(a.prefs.contrast,true);
    assert.equal(a.prefs.reading,true);
    assert.equal(a.prefs.cvd,'deuteranopia');
    assert.equal(a.dataset.mrlTheme,'light');
    assert.equal(a.dataset.mrlContrast,'on');
    assert.equal(a.dataset.mrlReading,'on');
    assert.equal(a.dataset.mrlCvd,'deuteranopia');
    assert.ok(a.documentWidth<=a.viewport+4,'Rolagem horizontal na Home '+width+': '+JSON.stringify(a));
    await page.screenshot({path:'qa/browser-artifacts/'+name+'-H08-home-'+width+'-fonte200.png',fullPage:true});
    // O fechamento via Escape deve restaurar o foco ao botão de origem.
    await page.keyboard.press('Escape');
    await page.locator('#settingsPanel').waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>document.activeElement.id),'homeSettingsBtn');
    await page.locator('#homeNewProject').click();
    await page.locator('#app').waitFor({state:'visible'});
    const original=JSON.stringify((await read(page)).data);
    await openSettings(page,'#editorSettingsBtn');
    for(let n=0;n<5;n++) await page.locator('#mrlFontMinus').click();
    assert.equal((await read(page)).output,'150%');
    await page.locator('#mrlA11yCvd').selectOption('tritanopia');
    const after=await read(page);
    assert.equal(JSON.stringify(after.data),original,'Aparência modificou dados científicos');
    assert.equal(after.prefs.font,150);
    assert.equal(after.prefs.cvd,'tritanopia');
    assert.ok(after.documentWidth<=after.viewport+4,
      'Rolagem horizontal indevida no editor '+width+': '+JSON.stringify(after));
    await page.screenshot({path:'qa/browser-artifacts/'+name+'-H08-editor-'+width+'-fonte150.png',fullPage:true});
    await page.locator('#settingsClose').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'editorSettingsBtn');
    await page.reload({waitUntil:'domcontentloaded'});
    const persisted=await read(page);
    assert.equal(persisted.prefs.font,150,'Fonte não persistiu');
    assert.equal(persisted.prefs.cvd,'tritanopia','Visão de cores não persistiu');
    assert.equal(persisted.prefs.contrast,true,'Alto contraste não persistiu');
    assert.equal(persisted.prefs.reading,true,'Leitura simples não persistiu');
    assert.ok(!runtimeErrors.length,'Erro no navegador: '+runtimeErrors.join(' | '));
    console.log('OK '+name+' H08 '+width+'x'+height+' — preferências, 200%, tema, foco, persistência e dados íntegros');
  }catch(error){
    failures.push('H08 '+width+'x'+height+': '+error.stack);
    await page.screenshot({path:'qa/browser-artifacts/'+name+'-H08-'+width+'-erro.png',fullPage:true}).catch(()=>{});
  }finally{
    await context.close();
  }
}
try{
  await oneViewport(390,844);
  await oneViewport(1440,900);
}finally{
  await browser.close();
}
if(failures.length){
  for(const error of failures) console.error('FALHA '+name+' '+error);
  process.exitCode=1;
}else console.log('H08 navegador '+name+': APROVADO');
