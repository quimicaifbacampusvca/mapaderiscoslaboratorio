// Homologação real H01-H10: navegador completo e perfis isolados.
// Estes testes NÃO acessam o perfil ou os projetos do usuário.
import {test, expect} from '@playwright/test';

const AUTOSAVE = 'mapa_riscos_autosave';
const PREVIOUS = 'mapa_riscos_previous_autosave';
const PREFERENCES = 'mrl_accessibility_preferences_v1';

function project(name='Laboratório QA',withObjects=false) {
  const kinds=['bench','door','sink','hood','chemical','biological','physical','electrical'];
  const objects=withObjects ? kinds.map((type,i)=>({
    id:'qa-object-'+i,type,x:1+(i%4)*2,y:1+Math.floor(i/4)*2,
    w:0.8,h:0.7,rot:0,hidden:false,locked:false,epi:type==='chemical'?'Luvas':undefined
  })) : [];
  const a={id:'qa-area-1',nome:name,tipo:'laboratorio',
    dimensoes:{w:12,h:8},posicaoGlobal:{x:0,y:0},objetos:objects,conexoes:[]};
  return {version:4,date:'2026-10-21T12:00:00.000Z',areas:[a],areaAtiva:a.id};
}

async function visit(page,{autosave=false,previous=false,objects=false}={}) {
  if(autosave || previous) {
    await page.addInitScript(({current,backup})=>{
      const marker='__mrl_homologacao_semeado';
      if(localStorage.getItem(marker)) return;
      if(current) localStorage.setItem('mapa_riscos_autosave',JSON.stringify(current));
      if(backup) localStorage.setItem('mapa_riscos_previous_autosave',JSON.stringify(backup));
      localStorage.setItem(marker,'1');
    },{current:autosave?project('Laboratório QA',objects):null,
      backup:previous?project('Cópia anterior QA',true):null});
  }
  await page.goto('/');
  await expect(page.locator('#homeScreen')).toBeVisible();
  await page.waitForFunction(()=>Boolean(window.MAPA_RUNTIME && window.MapaProjectLibrary && window.MRLAccessibility));
}

async function editor(page, options={}) {
  await visit(page,{autosave:true,...options});
  await page.locator('#homeContinue').click();
  await expect(page.locator('#app')).toBeVisible();
}

async function openSettings(page) {
  const trigger=page.locator('#app.hidden').count;
  // Escolher o botão de configurações a partir da tela visível.
  const inEditor=await page.locator('#app').evaluate(e=>!e.classList.contains('hidden'));
  await page.locator(inEditor?'#editorSettingsBtn':'#homeSettingsBtn').click();
  await expect(page.locator('#settingsPanel')).toHaveAttribute('open','');
  await page.locator('#mrlA11ySummary').click();
  await expect(page.locator('#mrlA11yBody')).toBeVisible();
}

function rgb(css) {
  const m=css.match(/rgba?\(([^)]+)\)/);
  if(!m) return null;
  const p=m[1].split(/[\s,\/]+/).map(Number);
  return p.length>=3 ? p.slice(0,3) : null;
}

test('H01 — Home: autosave, data e ações visíveis',async({page})=>{
  await visit(page,{autosave:true});
  await expect(page.locator('#recentProjects')).toBeVisible();
  await expect(page.locator('#recentList')).toContainText('Salvo neste navegador');
  await expect(page.locator('#homeContinue')).toBeVisible();
  await page.screenshot({path:test.info().outputPath('H01-home.png'),fullPage:true});
});

test('H02 — cópia anterior: restauração com confirmação',async({page})=>{
  await visit(page,{autosave:true,previous:true});
  await expect(page.locator('#previousProjectRow')).toBeVisible();
  await page.locator('#homeRestorePrevious').click();
  await expect(page.locator('#confirmModal')).toBeVisible();
  await expect(page.locator('#confirmBackup')).toBeVisible();
  await page.locator('#cancelConfirm').click();
  await expect(page.locator('#confirmModal')).toBeHidden();
  await expect(page.locator('#previousProjectRow')).toBeVisible();
});

test('H03 — biblioteca: dois projetos, revisão e exclusão confirmada',async({page})=>{
  await visit(page);
  await page.evaluate(async payload=>{
    await window.MapaProjectLibrary.save({id:'qa-library-1',name:'Projeto QA A',payload,revision:true});
    await window.MapaProjectLibrary.save({id:'qa-library-2',name:'Projeto QA B',payload,revision:true});
  },project());
  await page.locator('#homeLibrary').click();
  await expect(page.locator('#libraryList .library-item')).toHaveCount(2);
  await page.locator('#libraryList .library-item').first().getByRole('button',{name:'Revisões'}).click();
  await expect(page.locator('.library-revisions')).toBeVisible();
  const first=page.locator('#libraryList .library-item').first();
  await first.getByRole('button',{name:'Excluir',exact:true}).click();
  await expect(page.locator('#libraryList .library-item').first().getByRole('button',{name:'Confirmar exclusão'})).toBeVisible();
  await page.locator('#libraryList .library-item').first().getByRole('button',{name:'Confirmar exclusão'}).click();
  await expect(page.locator('#libraryList .library-item')).toHaveCount(1);
  await page.locator('#libraryClose').click();
  await expect(page.locator('#homeLibrary')).toBeFocused();
});

test('H04 — modelos: cartões, Escape e retorno de foco',async({page})=>{
  await visit(page);
  await page.locator('#homeUseModel').click();
  await expect(page.locator('#modelsModal')).toBeVisible();
  expect(await page.locator('#modelsGrid .model-card').count()).toBeGreaterThan(0);
  await page.screenshot({path:test.info().outputPath('H04-modelos.png')});
  await page.keyboard.press('Escape');
  await expect(page.locator('#modelsModal')).toBeHidden();
  await expect(page.locator('#homeUseModel')).toBeFocused();
});

test('H05 — confirmação: cancelar preserva o projeto e o foco',async({page})=>{
  await visit(page,{autosave:true,objects:true});
  const before=await page.evaluate(key=>localStorage.getItem(key),AUTOSAVE);
  await page.locator('#homeNewProject').click();
  await expect(page.locator('#confirmTitle')).toHaveText('Preservar o projeto anterior');
  await expect(page.locator('#cancelConfirm')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#confirmModal')).toBeHidden();
  expect(await page.evaluate(key=>localStorage.getItem(key),AUTOSAVE)).toBe(before);
  await expect(page.locator('#homeNewProject')).toBeFocused();
});

test('H06 — editor: oito objetos, quatro riscos, bloqueio e zoom não destrutivo',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await editor(page,{objects:true});
  await expect(page.locator('#objectsTree .tree-item[role="option"]')).toHaveCount(8);
  await expect(page.locator('#riskList .risk-row')).toHaveCount(4);
  const before=await page.evaluate(()=>JSON.stringify(window.MAPA_RUNTIME.state.areas));
  await page.locator('#objectsTree .tree-item').first().click();
  await page.locator('#objectsTree .tree-item').first().getByRole('button',{name:/Bloquear elemento/}).click();
  expect(await page.evaluate(()=>window.MAPA_RUNTIME.state.areas[0].objetos.some(o=>o.locked))).toBe(true);
  const afterLock=await page.evaluate(()=>JSON.stringify(window.MAPA_RUNTIME.state.areas));
  await page.locator('#zoomIn').click();
  await page.locator('#zoomOut').click();
  expect(await page.evaluate(()=>JSON.stringify(window.MAPA_RUNTIME.state.areas))).toBe(afterLock);
  expect(before).not.toBe(afterLock);
  await page.screenshot({path:test.info().outputPath('H06-editor.png')});
});

test('H07 — relatório: indicadores dinâmicos e contraste CSS',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await editor(page,{objects:true});
  await page.locator('#panelTab-report').click();
  await page.locator('#openComplianceReport').click();
  await expect(page.locator('#complianceReportModal')).toBeVisible();
  await expect(page.locator('#reportSummary .report-stat')).toHaveCount(3);
  await expect(page.locator('#reportList .report-score.pending')).toHaveCount(1);
  const ratios=await page.locator('#complianceReportModal .report-stat b, #complianceReportModal .report-score.pending').evaluateAll(nodes=>{
    function components(css){const m=css.match(/rgba?\(([^)]+)\)/);return m?m[1].split(/[\s,\/]+/).map(Number):null;}
    function luminance(v){return v.slice(0,3).map(n=>{let x=n/255;return x<=0.04045?x/12.92:Math.pow((x+0.055)/1.055,2.4);}).reduce((a,x,i)=>a+x*[0.2126,0.7152,0.0722][i],0);}
    return nodes.map(el=>{
      const fg=components(getComputedStyle(el).color);
      let target=el,bg=null;
      while(target && !bg){const c=components(getComputedStyle(target).backgroundColor);if(c && (c[3]===undefined || c[3]>0.99))bg=c;target=target.parentElement;}
      if(!fg || !bg) return 0;
      const a=luminance(fg),b=luminance(bg);
      return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
    });
  });
  expect(ratios.length).toBe(4);
  for(const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({path:test.info().outputPath('H07-relatorio.png')});
  await page.locator('#btnCloseComplianceReport').click();
  await expect(page.locator('#openComplianceReport')).toBeFocused();
});

test('H08 — preferências: tema, contraste, escala e persistência',async({page})=>{
  await visit(page);
  await openSettings(page);
  await page.locator('#mrlA11yDark').uncheck();
  await page.locator('#mrlA11yContrast').check();
  await page.locator('#mrlFontPlus').click();
  await page.locator('#mrlA11yCvd').selectOption('deuteranopia');
  await expect(page.locator('#mrlFontOutput')).toHaveText('110%');
  await page.locator('#settingsClose').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-mrl-theme','light');
  await expect(page.locator('html')).toHaveAttribute('data-mrl-contrast','on');
  await expect(page.locator('html')).toHaveAttribute('data-mrl-cvd','deuteranopia');
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).font,PREFERENCES)).toBe(110);
});

test('H09 — importação: JSON inválido não altera o autosave',async({page})=>{
  await visit(page,{autosave:true,objects:true});
  const before=await page.evaluate(key=>localStorage.getItem(key),AUTOSAVE);
  await page.locator('#homeUseModel').click();
  await page.locator('#modelFileInput').setInputFiles({
    name:'modelo-invalido.json',mimeType:'application/json',buffer:Buffer.from('{"areas":[]}')
  });
  await expect(page.locator('#toastContainer')).toContainText('Arquivo JSON de modelo inválido');
  expect(await page.evaluate(key=>localStorage.getItem(key),AUTOSAVE)).toBe(before);
  await page.locator('#modelFileInput').setInputFiles({
    name:'modelo-valido.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project('Modelo QA')))
  });
  await expect(page.locator('#confirmModal')).toBeVisible();
  await page.locator('#cancelConfirm').click();
  expect(await page.evaluate(key=>localStorage.getItem(key),AUTOSAVE)).toBe(before);
});

test('H10 — tipo de área: combobox, setas, Enter, Escape e Tab',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await editor(page);
  const combo=page.locator('#mrl-trigger-areaType');
  await combo.focus();
  await page.keyboard.press('Enter');
  await expect(combo).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(combo).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#areaType')).toHaveValue('almoxarifado');
  await combo.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(combo).toBeFocused();
  await expect(combo).toHaveAttribute('aria-expanded','false');
  await page.keyboard.press('Tab');
  await expect(combo).not.toBeFocused();
});

// Amostragem de condições relevantes, sem afirmar cobertura combinatória completa.
test('M01 — configurações responsivas em cinco viewports',async({page})=>{
  await visit(page);
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1440,900]]) {
    await page.setViewportSize({width,height});
    await openSettings(page);
    await expect(page.locator('#mrlA11yDark')).toBeVisible();
    await expect(page.locator('#mrlA11yContrast')).toBeVisible();
    await expect(page.locator('#mrlA11yReset')).toBeVisible();
    await page.locator('#settingsClose').click();
    await expect(page.locator('#settingsPanel')).not.toBeVisible();
  }
});
