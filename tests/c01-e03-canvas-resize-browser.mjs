import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium, firefox, webkit} from 'playwright';

const browserName = process.argv[2] || 'chromium';
const browserType = {chromium, firefox, webkit}[browserName];
if (!browserType) throw new Error('Navegador desconhecido: ' + browserName);
const url = process.env.MRL_TEST_URL || 'http://127.0.0.1:8765/';
const browser = await browserType.launch({headless:true});
const failures = [];

function near(a,b,tolerance=.045){assert.ok(Math.abs(a-b)<tolerance, 'Esperado '+a+' próximo de '+b);}
async function snapshot(page,handle='se'){
  return page.evaluate((handle)=>{
    const o=window.MAPA_RUNTIME.state.objects[0];
    const rect=document.getElementById('canvas').getBoundingClientRect();
    const point=getObjectHandles(o)[handle];
    return {x:o.x,y:o.y,w:o.w,h:o.h,rot:o.rot,locked:o.locked,hidden:o.hidden,
      selected:window.MAPA_RUNTIME.state.selectedObjects.length,
      hx:rect.left+point.x,hy:rect.top+point.y,
      touchAction:getComputedStyle(document.getElementById('canvas')).touchAction};
  },handle);
}
async function drag(page,s,dx,dy){
  await page.mouse.move(s.hx,s.hy);
  await page.mouse.down();
  await page.mouse.move(s.hx+dx,s.hy+dy,{steps:8});
  await page.mouse.up();
}
async function testViewport(width,height){
  const context = await browser.newContext({viewport:{width,height},acceptDownloads:true});
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('#homeNewProject').click();
    await page.locator('#app').waitFor({state:'visible'});
    if(width<769)await page.locator('#btnToggleTools').click();
    await page.locator('.palette button[data-type="bench"]').click();
    if(width<769)await page.locator('#closeToolsPanel').click();
    await page.waitForFunction(()=>window.MAPA_RUNTIME?.state.objects.length===1);
    const start=await snapshot(page);
    assert.equal(start.selected,1);
    assert.equal(start.touchAction,'none');
    await drag(page,start,45,30);
    const resized=await snapshot(page);
    assert.ok(resized.w>start.w+.05,'Arrastar a alça SE precisa aumentar a largura');
    assert.ok(resized.h>start.h+.05,'Arrastar a alça SE precisa aumentar a altura');
    near(resized.x,start.x);
    near(resized.y,start.y);

    await page.locator('#undo').click();
    const undone=await snapshot(page);
    near(undone.w,start.w);
    near(undone.h,start.h);
    await page.locator('#redo').click();
    const redone=await snapshot(page);
    near(redone.w,resized.w);
    near(redone.h,resized.h);

    await page.evaluate(()=>{
      const o=window.MAPA_RUNTIME.state.objects[0];
      o.rot=45;
      requestDraw();
    });
    const before=await snapshot(page,'e');
    const rad=before.rot*Math.PI/180;
    const westBefore={x:before.x+before.w/2-Math.cos(rad)*before.w/2,
                      y:before.y+before.h/2-Math.sin(rad)*before.w/2};
    await drag(page,before,Math.cos(rad)*45,Math.sin(rad)*45);
    const after=await snapshot(page,'e');
    assert.ok(after.w>before.w+.05,'Alça E girada precisa aumentar largura local');
    near(after.h,before.h);
    const westAfter={x:after.x+after.w/2-Math.cos(rad)*after.w/2,
                     y:after.y+after.h/2-Math.sin(rad)*after.w/2};
    near(westAfter.x,westBefore.x);
    near(westAfter.y,westBefore.y);

    await page.evaluate(()=>{
      const o=window.MAPA_RUNTIME.state.objects[0];
      o.locked=true;requestDraw();
    });
    const locked=await snapshot(page,'e');
    const handleLocked=await page.evaluate(()=>{
      const o=window.MAPA_RUNTIME.state.objects[0];
      const p=getObjectHandles(o).e;
      return hitTestHandle(p.x,p.y,o);
    });
    assert.equal(handleLocked,null,'Objeto bloqueado não oferece alça ativa');
    await drag(page,locked,60,0);
    const lockedAfter=await snapshot(page);
    near(lockedAfter.w,locked.w);
    near(lockedAfter.h,locked.h);
    await page.evaluate(()=>{
      const o=window.MAPA_RUNTIME.state.objects[0];
      o.locked=false;o.hidden=true;requestDraw();
    });
    assert.equal(await page.evaluate(()=>{
      const o=window.MAPA_RUNTIME.state.objects[0],p=getObjectHandles(o).e;
      return hitTestHandle(p.x,p.y,o);
    }),null,'Objeto oculto não pode ser manipulado pela alça');

    assert.deepEqual(errors,[],'Erros JS não tratados: '+errors.join('; '));
    console.log('OK '+browserName+' '+width+'x'+height+': resize, rotação, âncora, lock, undo/redo');
  }catch(e){
    failures.push(width+'x'+height+': '+e.stack);
    await fs.mkdir('qa/browser-artifacts',{recursive:true});
    await page.screenshot({path:'qa/browser-artifacts/'+browserName+'-canvas-resize-'+width+'-erro.png',fullPage:true}).catch(()=>{});
  }finally{await context.close();}
}
try{
  await testViewport(1440,900);
  await testViewport(390,844);
}finally{await browser.close();}
if(failures.length){
  failures.forEach(x=>console.error('FALHA '+browserName+' '+x));
  process.exitCode=1;
}else console.log('C01/E03 redimensionamento direto APROVADO '+browserName);
