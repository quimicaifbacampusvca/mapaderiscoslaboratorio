"""Homologação UIUX-0.7.0. Chromium local: load real HTML/CSS/scripts in an isolated page.
Not a replacement for GitHub Pages or Firefox/WebKit E2E testing.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,traceback
ROOT=Path(__file__).resolve().parents[1]
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',(ROOT/'index.html').read_text(encoding='utf-8'))
html=html.replace('<link rel="stylesheet" href="css/mapa.css">','')
css=(ROOT/'css/mapa.css').read_text(encoding='utf-8')
scripts=[(ROOT/'js'/s).read_text(encoding='utf-8') for s in ['types.js','geometry.js','validation.js','metric-ruler.js','mapa.js']]
results=[]

def check(name,ok,detail=''):
 results.append({'name':name,'ok':bool(ok),'detail':str(detail)[:300]}); print(('PASS ' if ok else 'FAIL ')+name+' '+str(detail)[:70],flush=True)

def boot(browser,w,h):
 c=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce',accept_downloads=True)
 p=c.new_page();p.set_default_timeout(5000);err=[];p.on('pageerror',lambda e:err.append(str(e)))
 p.set_content(html,wait_until='load');p.add_style_tag(content=css)
 p.evaluate('''()=>{const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()}});if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(36).slice(2)}''')
 for s in scripts:p.add_script_tag(content=s)
 p.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))');return c,p,err

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for w,h in [(320,568),(360,640),(390,844),(414,896),(768,900),(1024,768),(1440,900)]:
  c,p,errors=boot(browser,w,h)
  try:
   tag=f'{w}x{h}'
   check(tag+' login_absent',p.locator('#loginScreen,#logoutBtn,.home-storage-note').count()==0)
   check(tag+' home_actions_present',all(p.locator('#'+name).count()==1 for name in ['homeNewProject','homeUseModel','homeOpenProject','homeImportModel']))
   check(tag+' mobile_hover_static', p.locator('#homeNewProject').evaluate('''el=>{el.focus();return innerWidth>540 || getComputedStyle(el).transform==='none'}'''))
   p.locator('#homeNewProject').click()
   check(tag+' enters_editor',p.locator('#app').is_visible() and p.evaluate('MAPA_RUNTIME.state.room.w')==12)
   check(tag+' toolbar_accessible', all(p.locator('#'+x).count()==1 for x in ['grid','snap','ruler','zoomIn','zoomOut']))
   check(tag+' default_units', p.evaluate('MetricRuler.chooseLevel(MAPA_RUNTIME.state.cam.zoom).label')=='1 m')
   p.evaluate('MAPA_RUNTIME.state.cam.zoom=1150;requestDraw()')
   check(tag+' one_centimeter',p.evaluate('MetricRuler.chooseLevel(MAPA_RUNTIME.state.cam.zoom).label')=='1 cm')
   check(tag+' centimeter_scale',abs(p.evaluate('''()=>worldToScreen(2.01,2).x-worldToScreen(2,2).x''')-11.5)<0.0001)
   p.evaluate("MAPA_RUNTIME.state.areas[0].nome='Registro preservado';scheduleAutoSave()")
   p.wait_for_timeout(920)
   p.locator('#homeBtn').click();p.locator('#homeNewProject').click()
   check(tag+' replacement_requires_confirmation',p.locator('#confirmModal').is_visible())
   p.locator('#cancelConfirm').click();p.wait_for_timeout(150)
   check(tag+' cancel_preserves',p.evaluate('MAPA_RUNTIME.state.areas[0].nome')=='Registro preservado')
   # This failed at 320px before the home-card hover/focus stabilization.
   p.locator('#homeNewProject').click(timeout=3500)
   check(tag+' repeated_new_project_clickable',p.locator('#confirmModal').is_visible())
   p.locator('#confirmAction').click();p.wait_for_timeout(160)
   check(tag+' previous_project_backup', 'Registro preservado' in p.evaluate('localStorage.getItem("mapa_riscos_previous_autosave")||""'))
   check(tag+' blank_project_created',p.evaluate('MAPA_RUNTIME.state.areas[0].nome')=='Laboratório')
   check(tag+' no_unhandled_js_errors',not errors,errors)
   if w in [320,390,1440]:p.screenshot(path=str(ROOT/'qa070'/f'uiux070-editor-{w}px.png'))
  except Exception as exc: check(f'{w}x{h} scenario_exception',False,str(exc)[:300])
  finally:c.close()
 # Keyboard and modal control special-case
 c,p,err=boot(browser,320,568)
 try:
  p.locator('#homeNewProject').focus();p.keyboard.press('Enter')
  check('keyboard_enter_starts_project',p.locator('#app').is_visible())
  p.locator('#btnToggleTools').click();p.wait_for_timeout(80)
  check('drawer_focus_transfer',p.evaluate('document.activeElement.id==="closeToolsPanel"'))
  p.keyboard.press('Escape')
  check('drawer_escape_closes',not p.locator('#leftPanel').evaluate('e=>e.classList.contains("mobile-open")'))
  check('drawer_escape_restores_focus',p.evaluate('document.activeElement.id==="btnToggleTools"'))
  check('keyboard_no_runtime_errors',not err,err)
 except Exception as exc:check('keyboard_scenario_exception',False,str(exc)[:300])
 finally:c.close()
 browser.close()
out=ROOT/'qa070'/'MATRIZ-UIUX-0.7.0.json';out.write_text(json.dumps({'environment':'Chromium /usr/bin/chromium, Playwright isolated HTML/CSS/JS; not a hosted HTTP test','results':results},ensure_ascii=False,indent=2),encoding='utf-8')
print('RESULT',sum(x['ok'] for x in results),'/',len(results),flush=True)
if not all(x['ok'] for x in results):raise SystemExit(1)
