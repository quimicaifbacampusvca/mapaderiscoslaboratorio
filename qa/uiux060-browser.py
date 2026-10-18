from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re
ROOT=Path(__file__).resolve().parents[1]
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',(ROOT/'index.html').read_text()).replace('<link rel="stylesheet" href="css/mapa.css">','')
css=(ROOT/'css/mapa.css').read_text()
scripts=[(ROOT/'js'/n).read_text() for n in ['types.js','geometry.js','validation.js','metric-ruler.js','mapa.js']]
results=[]
def check(name,value,detail=''):
 results.append({'name':name,'ok':bool(value),'detail':str(detail)});print(('OK ' if value else 'FAIL ')+name+' '+str(detail)[:60],flush=True)
def boot(b,w,h=820):
 c=b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce',accept_downloads=True)
 p=c.new_page();errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_default_timeout(2500)
 p.set_content(html,wait_until='load');p.add_style_tag(content=css)
 p.evaluate('''()=>{const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}});if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(36).slice(2)}''')
 for s in scripts:p.add_script_tag(content=s)
 p.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))')
 return c,p,errs
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for width in [320,390,768,1100,1440]:
  c,p,errors=boot(b,width)
  try:
   tag=str(width)
   check(tag+' removed banner',p.locator('.home-storage-note').count()==0)
   check(tag+' new project visible',p.locator('#homeNewProject').is_visible())
   p.locator('#homeNewProject').click()
   check(tag+' editor opens',p.locator('#app').is_visible())
   state=p.evaluate('''()=>{return ['selectMode','panMode','grid','snap','ruler'].map(id=>({id,pressed:document.getElementById(id).getAttribute('aria-pressed')}))}''')
   check(tag+' toolbar aria initial',state==[{'id':'selectMode','pressed':'true'},{'id':'panMode','pressed':'false'},{'id':'grid','pressed':'true'},{'id':'snap','pressed':'true'},{'id':'ruler','pressed':'false'}],state)
   p.evaluate('document.getElementById("grid").click();document.getElementById("snap").click();document.getElementById("ruler").click()')
   check(tag+' toggles announce',p.evaluate('''()=>document.getElementById('grid').getAttribute('aria-pressed')==='false'&&document.getElementById('snap').getAttribute('aria-pressed')==='false'&&document.getElementById('ruler').getAttribute('aria-pressed')==='true' '''))
   p.evaluate('document.getElementById("panMode").click()')
   check(tag+' tool switch aria',p.evaluate('''()=>document.getElementById('panMode').getAttribute('aria-pressed')==='true'&&document.getElementById('selectMode').getAttribute('aria-pressed')==='false' '''))
   p.evaluate('''()=>{showToast('Aviso duplicado','info');showToast('Aviso duplicado','info')}''')
   check(tag+' toast dedupe',p.locator('.toast').filter(has_text='Aviso duplicado').count()==1)
   check(tag+' toast aria',p.locator('.toast').filter(has_text='Aviso duplicado').get_attribute('aria-atomic')=='true')
   p.evaluate('''()=>{const s=MAPA_RUNTIME.state;const o={id:crypto.randomUUID(),type:'bench',x:2,y:2,w:2,h:1,rot:0};s.areas[0].objetos.push(o);s.selected=o;s.selectedObjects=[o];updateUI();requestDraw()}''')
   # Do not allow editing with keys when focus is on another button.
   p.evaluate('document.getElementById("homeBtn").focus()')
   initial=p.evaluate('MAPA_RUNTIME.state.areas[0].objetos[0].x')
   p.keyboard.press('ArrowRight');p.keyboard.press('Delete');p.keyboard.press('r')
   check(tag+' control focus protected',p.evaluate('''()=>MAPA_RUNTIME.state.areas[0].objetos.length===1&&MAPA_RUNTIME.state.areas[0].objetos[0].x===2&&MAPA_RUNTIME.state.areas[0].objetos[0].rot===0'''))
   # Ctrl+L/P/D/F must not be canceled by application.
   for code,key in [('l','l'),('p','p'),('d','d'),('f','f')]:
    out=p.evaluate('''key=>{const event=new KeyboardEvent('keydown',{key,ctrlKey:true,bubbles:true,cancelable:true});window.dispatchEvent(event);return event.defaultPrevented}''',key)
    check(tag+' browser ctrl+'+code+' free',out is False)
   p.evaluate('document.getElementById("canvas").focus()')
   p.keyboard.press('ArrowRight')
   check(tag+' canvas keyboard move',p.evaluate('MAPA_RUNTIME.state.areas[0].objetos[0].x > 2'))
   p.keyboard.press('Alt+Shift+L');p.wait_for_timeout(100)
   check(tag+' layers accelerator',p.evaluate('''()=>document.activeElement.id==='objectsTree'||document.activeElement.classList.contains('tree-item')'''))
   p.keyboard.press('Alt+Shift+P');p.wait_for_timeout(100)
   check(tag+' props accelerator',p.evaluate('''()=>document.activeElement.id==='x'&&document.getElementById('panelTab-properties').getAttribute('aria-selected')==='true' '''))
   # Switch tab via keyboard, test if panel can be reached on desktop
   if width>1100:
    p.locator('#panelTab-layers').focus();p.keyboard.press('End')
    check(tag+' roving tab focus',p.evaluate('''()=>document.activeElement.id==='panelTab-report'&&document.getElementById('panelTab-report').tabIndex===0'''))
   check(tag+' no JS errors',not errors,errors)
   if width in [320,390,1440]:p.screenshot(path=str(ROOT/'qa'/f'uiux060-editor-{width}px.png'))
  except Exception as e:check(str(width)+' browser scenario exception',False,str(e)[:250])
  finally:c.close()
 b.close()
(ROOT/'qa'/'uiux060-browser-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('RESULT',sum(x['ok'] for x in results),'/',len(results),flush=True)
if not all(x['ok'] for x in results): raise SystemExit(1)
