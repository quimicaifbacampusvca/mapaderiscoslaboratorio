// Suite complementar de acessibilidade no aplicativo real.
// Páginas e armazenamentos isolados no Playwright; sem acesso ao perfil do usuário.
import {test,expect} from '@playwright/test';

const KEY = 'mrl_accessibility_preferences_v1';
const AUTOSAVE = 'mapa_riscos_autosave';
const fakeProject={
  version:4,date:'2026-10-21T12:00:00.000Z',
  areas:[{id:'qa-contraste-area',nome:'Laboratório QA',tipo:'laboratorio',
    dimensoes:{w:12,h:8},posicaoGlobal:{x:0,y:0},objetos:[],conexoes:[]}],
  areaAtiva:'qa-contraste-area'
};

async function home(page) {
  await page.addInitScript(project=>{
    if(localStorage.getItem('__qa_acessibilidade')) return;
    localStorage.setItem('mapa_riscos_autosave',JSON.stringify(project));
    localStorage.setItem('__qa_acessibilidade','1');
  },fakeProject);
  await page.goto('./');
  await expect(page.locator('#homeScreen')).toBeVisible();
  await page.waitForFunction(()=>!!window.MRLAccessibility && !!window.MAPA_RUNTIME);
}
async function settings(page) {
  const editing=await page.locator('#app').evaluate(e=>!e.classList.contains('hidden'));
  await page.locator(editing?'#editorSettingsBtn':'#homeSettingsBtn').click();
  await expect(page.locator('#settingsPanel')).toBeVisible();
  const details=page.locator('#mrlA11yDetails');
  if(!await details.evaluate(el=>el.open)) await page.locator('#mrlA11ySummary').click();
  await expect(page.locator('#mrlA11yBody')).toBeVisible();
}
async function setCheck(page,id,enabled) {
  if(enabled) await page.locator(id).check();
  else await page.locator(id).uncheck();
}
async function ratiosFor(page,selectors) {
  return await page.evaluate(selectors=>{
    function parse(s){const m=s.match(/rgba?\(([^)]+)\)/);return m?m[1].split(/[\s,/]+/).map(Number):null;}
    function luminance(parts) {
      const rgb=parts.slice(0,3).map(v=>{const z=v/255;return z<=0.04045?z/12.92:Math.pow((z+0.055)/1.055,2.4);});
      return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2];
    }
    return selectors.map(selector=>{
      const el=document.querySelector(selector);
      if(!el) return {selector,ratio:null,reason:'Elemento ausente'};
      const fg=parse(getComputedStyle(el).color);
      let target=el,bg=null;
      while(target&&!bg){
        const c=parse(getComputedStyle(target).backgroundColor);
        if(c&&(c[3]===undefined||c[3]===1))bg=c;
        target=target.parentElement;
      }
      if(!fg||!bg) return {selector,ratio:null,reason:'Cores não resolvidas'};
      const l1=luminance(fg),l2=luminance(bg);
      return {selector,ratio:Number(((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2))};
    });
  },selectors);
}

test('C01 — indicadores dinâmicos: contraste nas quatro combinações cromáticas',async({page})=>{
  await home(page);
  for(const [dark,contrast,reading] of [
    [false,false,false],[false,true,true],[true,false,false],[true,true,true]
  ]) {
    await settings(page);
    await setCheck(page,'#mrlA11yDark',dark);
    await setCheck(page,'#mrlA11yContrast',contrast);
    await setCheck(page,'#mrlA11yReading',reading);
    await page.locator('#settingsClose').click();
    const homeRatios=await ratiosFor(page,['#recentList .recent-chip','#recentList .recent-chip:last-child']);
    for(const value of homeRatios) expect(value.ratio,JSON.stringify({dark,contrast,reading,...value})).toBeGreaterThanOrEqual(4.5);
    await page.locator('#homeContinue').click();
    await page.locator('#panelTab-report').click();
    await page.locator('#openComplianceReport').click();
    await expect(page.locator('#complianceReportModal')).toBeVisible();
    const reportRatios=await ratiosFor(page,[
      '#reportSummary .report-stat b','#reportList .report-score.pending'
    ]);
    for(const value of reportRatios) expect(value.ratio,JSON.stringify({dark,contrast,reading,...value})).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({path:test.info().outputPath('C01-'+(dark?'escuro':'claro')+'-'+(contrast?'alto':'normal')+'.png')});
    await page.locator('#btnCloseComplianceReport').click();
    await page.locator('#homeBtn').click();
    await expect(page.locator('#homeScreen')).toBeVisible();
  }
});

test('C02 — retenção e devolução de foco nos diálogos',async({page})=>{
  await home(page);
  await settings(page);
  for(let i=0;i<16;i++){
    await page.keyboard.press(i%2===0?'Tab':'Shift+Tab');
    expect(await page.locator('#settingsPanel').evaluate(el=>el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#settingsPanel')).not.toBeVisible();
  await expect(page.locator('#homeSettingsBtn')).toBeFocused();

  await page.locator('#homeUseModel').click();
  await expect(page.locator('#modelsModal')).toBeVisible();
  for(let i=0;i<20;i++){
    await page.keyboard.press(i%3===0?'Shift+Tab':'Tab');
    expect(await page.locator('#modelsModal').evaluate(el=>el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#modelsModal')).toBeHidden();
  await expect(page.locator('#homeUseModel')).toBeFocused();
});

test('C03 — preferências extremas sobrevivem à recarga sem alterar o projeto JSON',async({page})=>{
  await home(page);
  const previous=await page.evaluate(key=>localStorage.getItem(key),AUTOSAVE);
  await settings(page);
  await setCheck(page,'#mrlA11yDark',false);
  await setCheck(page,'#mrlA11yContrast',true);
  await setCheck(page,'#mrlA11yReading',true);
  await page.locator('#mrlA11yCvd').selectOption('acromatopsia');
  for(let i=0;i<10;i++) await page.locator('#mrlFontPlus').click();
  await expect(page.locator('#mrlFontOutput')).toHaveText('200%');
  await page.locator('#settingsClose').click();
  await page.reload();
  await expect(page.locator('#homeScreen')).toBeVisible();
  const prefs=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
  expect(prefs).toMatchObject({dark:false,contrast:true,reading:true,font:200,cvd:'acromatopsia'});
  expect(await page.evaluate(()=>window.MRLAccessibility.getPreferences())).toMatchObject(prefs);
  expect(await page.evaluate(key=>localStorage.getItem(key),AUTOSAVE)).toBe(previous);
});

test('C04 — texto 200%: controles essenciais não extrapolam horizontalmente',async({page})=>{
  await home(page);
  await settings(page);
  for(let i=0;i<10;i++) await page.locator('#mrlFontPlus').click();
  await page.locator('#settingsClose').click();
  for(const [width,height] of [[320,568],[390,844],[768,1024]]) {
    await page.setViewportSize({width,height});
    await expect(page.locator('#homeNewProject')).toBeVisible();
    await settings(page);
    for(const selector of ['#settingsClose','#mrlA11yReset','#mrlFontPlus']) {
      const rect=await page.locator(selector).evaluate(el=>{
        const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};
      });
      expect(rect.left,selector+' esquerda').toBeGreaterThanOrEqual(-2);
      expect(rect.right,selector+' direita').toBeLessThanOrEqual(width+2);
    }
    await page.screenshot({path:test.info().outputPath('C04-'+width+'.png')});
    await page.locator('#settingsClose').click();
  }
});

test('P01 — PWA: recarga offline preserva Home e projeto local',async({page,context,browserName})=>{
  await home(page);
  const before=await page.evaluate(key=>localStorage.getItem(key),AUTOSAVE);
  await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,null,{timeout:20_000});
  await context.setOffline(true);
  try {
    // WebKit/Linux pode falhar na API reload; testar navegação HTTPS equivalente offline.
    if(browserName==='webkit') await page.goto('./',{waitUntil:'domcontentloaded',timeout:15_000});
    else await page.reload({waitUntil:'domcontentloaded',timeout:15_000});
    await expect(page.locator('#homeScreen')).toBeVisible();
    await expect(page.locator('#homeContinue')).toBeVisible();
    expect(await page.evaluate(()=>navigator.onLine)).toBe(false);
    expect(await page.evaluate(key=>localStorage.getItem(key),AUTOSAVE)).toBe(before);
    await page.locator('#homeSettingsBtn').click();
    await expect(page.locator('#pwaOfflineStatus')).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
