from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',(ROOT/'index.html').read_text()).replace('<link rel="stylesheet" href="css/mapa.css">','')
css=(ROOT/'css/mapa.css').read_text()
scripts=[(ROOT/'js'/n).read_text() for n in ['types.js','geometry.js','validation.js','metric-ruler.js','mapa.js']]
checks=[]
def ck(name,cond,extra=None):
 checks.append({'name':name,'ok':bool(cond),'detail':extra}); print(('OK ' if cond else 'FAIL ')+name+(f' {str(extra)[:125]}' if extra else ''),flush=True)
def boot(browser,w,h,mobile=False):
 ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile,reduced_motion='reduce',accept_downloads=True)
 p=ctx.new_page();p.set_default_timeout(4000);errs=[];p.on('pageerror',lambda e:errs.append(str(e)))
 p.set_content(html,wait_until='load');p.add_style_tag(content=css)
 p.evaluate('''()=>{const mem=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return mem.get(k)??null},setItem(k,v){mem.set(k,String(v))},removeItem(k){mem.delete(k)},clear(){mem.clear()}}});if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(36).slice(2)}''')
 for script in scripts:p.add_script_tag(content=script)
 p.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))');p.locator('#homeNewProject').click();return ctx,p,errs
inside='''(id)=>{let e=document.querySelector(id),t=document.querySelector(id==='#ruler'?'#canvas':'.canvas-area'),r=e.getBoundingClientRect(),p=t.getBoundingClientRect();return r.width>20&&r.height>20&&r.left>=p.left-1&&r.right<=p.right+1&&r.top>=p.top-1&&r.bottom<=p.bottom+1}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,h in [(320,420),(320,568),(360,640),(390,844),(414,896),(768,1024),(820,600),(1024,768),(1440,900),(844,390),(600,360)]:
  c,p,errs=boot(browser,w,h)
  try:
   pref=f'{w}x{h}'
   d=p.evaluate('''()=>{const H=document.querySelector('header.topbar'),C=document.querySelector('#canvas'),W=document.querySelector('.canvas-toolbar'),a=C.getBoundingClientRect(),t=W.getBoundingClientRect();return {headerOverflow:H.scrollWidth>H.clientWidth+2,bodyOverflow:document.documentElement.scrollWidth>innerWidth+2,canvasW:a.width,canvasH:a.height,toolbarLeft:t.left,toolbarRight:t.right,headerH:H.getBoundingClientRect().height}}''')
   ck(pref+' no horizontal header overflow',not d['headerOverflow'],d)
   ck(pref+' no page overflow',not d['bodyOverflow'])
   ck(pref+' canvas usable',d['canvasW']>=w*0.55 and d['canvasH']>=min(200,h*.4),d)
   for id in ['#selectMode','#panMode','#grid','#snap','#ruler','#zoomOut','#zoomIn']:
    v=p.evaluate(inside,id);ck(pref+' toolbar visible '+id,v)
   if w<=1100:
    ck(pref+' mobile panel buttons visible',p.locator('#btnToggleTools').is_visible() and p.locator('#btnToggleProps').is_visible())
    p.locator('#btnToggleTools').click();p.wait_for_timeout(65)
    ck(pref+' tools open',p.locator('#leftPanel').evaluate('(e)=>e.classList.contains("mobile-open")&&!e.inert'))
    ck(pref+' backdrop shown',not p.locator('#mobilePanelBackdrop').evaluate('(e)=>e.hidden'))
    ck(pref+' focus tools close',p.evaluate('document.activeElement.id === "closeToolsPanel"'))
    ck(pref+' drawer stays inside viewport',p.locator('#leftPanel').evaluate('(e)=>{let r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&r.width<=innerWidth}'))
    p.keyboard.press('Escape');p.wait_for_timeout(30)
    ck(pref+' esc closes tools',not p.locator('#leftPanel').evaluate('(e)=>e.classList.contains("mobile-open")'))
    ck(pref+' esc returns trigger focus',p.evaluate('document.activeElement.id === "btnToggleTools"'))
    p.locator('#btnToggleProps').click();p.wait_for_timeout(65)
    ck(pref+' properties open',p.locator('#rightPanel').evaluate('(e)=>e.classList.contains("mobile-open")&&!e.inert'))
    p.locator('#closePropsPanel').click();p.wait_for_timeout(30)
    ck(pref+' close properties returns focus',p.evaluate('document.activeElement.id === "btnToggleProps"'))
    p.locator('#btnToggleTools').click();p.wait_for_timeout(65)
    p.mouse.click(w-3, min(h-25,max(d['headerH']+60,200)));p.wait_for_timeout(30)
    ck(pref+' backdrop closes drawer',p.locator('#mobilePanelBackdrop').evaluate('(e)=>e.hidden'))
    p.locator('#btnToggleTools').click();p.wait_for_timeout(65)
    p.locator('#homeBtn').click();p.wait_for_timeout(30)
    ck(pref+' home cleanup panels',p.locator('#mobilePanelBackdrop').evaluate('(e)=>e.hidden') and not p.locator('body').evaluate('(e)=>e.classList.contains("mobile-panel-active")'))
    p.locator('#homeContinue').click() if p.locator('#homeContinue').is_visible() else p.locator('#homeNewProject').click()
   # Zoom and selected object survive repeated width/height changes.
   p.evaluate('''()=>{const s=MAPA_RUNTIME.state;const a=s.areas[0];a.objetos.push({id:crypto.randomUUID(),type:'bench',x:1.5,y:2,w:2,h:.75,rot:0});s.selected=a.objetos[0];s.selectedObjects=[a.objetos[0]];s.cam.zoom=1150;s.ruler=true;requestDraw()}''')
   obj1=p.evaluate('''()=>{const s=MAPA_RUNTIME.state;return {id:s.selected.id,x:s.selected.x,y:s.selected.y,zoom:s.cam.zoom,w:s.room.w,h:s.room.h}}''')
   p.set_viewport_size({'width':max(320,h if w<600 else w-120),'height':max(350,w if h>700 else h+120)});p.wait_for_timeout(60)
   obj2=p.evaluate('''()=>{const s=MAPA_RUNTIME.state;return {id:s.selected.id,x:s.selected.x,y:s.selected.y,zoom:s.cam.zoom,w:s.room.w,h:s.room.h}}''')
   ck(pref+' resize preserves geometry, zoom and selection',obj1==obj2)
   ck(pref+' no runtime JS errors',not errs,errs[:2] if errs else None)
   if (w,h) in [(320,420),(320,568),(390,844),(820,600),(1440,900)]:
    p.screenshot(path=str(ROOT/'qa'/f'uiux050-editor-{w}x{h}.png'))
  except Exception as e:ck(f'{w}x{h} scenario exception',False,str(e)[:300])
  finally:c.close()
 # Check changing tablet drawer to desktop closes it without stale focus/overlay
 c,p,e=boot(browser,820,600)
 try:
  p.locator('#btnToggleTools').click()
  p.set_viewport_size({'width':1440,'height':900});p.wait_for_timeout(50)
  ck('tablet-to-desktop drawer closed',p.locator('#mobilePanelBackdrop').evaluate('(e)=>e.hidden'))
  ck('desktop panels interactive',not p.locator('#leftPanel').evaluate('(e)=>e.inert') and not p.locator('#rightPanel').evaluate('(e)=>e.inert'))
  ck('tablet-to-desktop no runtime errors',not e)
 finally:c.close()
 browser.close()
(ROOT/'qa'/'uiux050-browser-results.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
print('RESULT',sum(x['ok'] for x in checks),'/',len(checks),flush=True)
if any(not x['ok'] for x in checks): raise SystemExit(1)
