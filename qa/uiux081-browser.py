from pathlib import Path
import re, json, traceback, base64, time
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
HTML=(R/'index.html').read_text(encoding='utf8')
# Use the exact real resources but inject locally to avoid environment policy against localhost.
HTML=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',HTML)
HTML=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',HTML)
for name in ('mrl-symbol.svg','mrl-app-icon.svg'):
 p=R/'assets/svg'/name
 b64=base64.b64encode(p.read_bytes()).decode('ascii')
 HTML=HTML.replace(f'assets/svg/{name}',f'data:image/svg+xml;base64,{b64}')
CSS='\n'.join((R/'css'/file).read_text(encoding='utf8') for file in ['mapa.css','identidade-alerta-precisao.css'])
JS=[(R/'js'/x).read_text(encoding='utf8') for x in ['types.js','geometry.js','validation.js','metric-ruler.js','mapa.js']]
results=[]
def check(key,condition,detail=''):
 results.append({'check':key,'passed':bool(condition),'detail':str(detail)[:180]})
 if not condition: print('FAIL',key,detail,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for width,height in [(1440,900),(1024,768),(768,900),(414,896),(390,844),(360,740),(320,568)]:
  context=b.new_context(viewport={'width':width,'height':height},device_scale_factor=1,reduced_motion='reduce',accept_downloads=True)
  p=context.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_default_timeout(6000)
  tag=str(width)
  try:
   p.set_content(HTML,wait_until='load');p.add_style_tag(content=CSS)
   p.evaluate('''() => { const m=new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()}});if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(36).slice(2)}''')
   for code in JS:p.add_script_tag(content=code)
   p.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))')
   check(tag+' home',p.locator('#homeScreen').is_visible())
   check(tag+' logo-loaded',p.locator('.home-brand-mark img').evaluate('e=>e.complete && e.naturalWidth >0'))
   check(tag+' wordmark',p.locator('#homeTitle').inner_text().replace('\n',' ').count('Riscos')==1)
   check(tag+' graphite',p.locator('#homeScreen').evaluate('e=>getComputedStyle(e).backgroundImage.includes("radial-gradient")'))
   check(tag+' home-actions-visible',all(p.locator('#'+id).is_visible() for id in ['homeNewProject','homeUseModel','homeOpenProject','homeImportModel']))
   check(tag+' no-overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth+3'),p.evaluate('document.documentElement.scrollWidth'))
   check(tag+' no-legacy-banner','Sem login. O projeto atual é salvo automaticamente' not in p.content())
   if width in [1440,390,320]:
    p.locator('#homeScreen').evaluate('(e)=>e.scrollTop=0')
    p.screenshot(path=str(R/f'qa/home-{width}.png'))
   p.locator('#homeUseModel').click()
   check(tag+' open-models',p.locator('#modelsModal').is_visible())
   p.keyboard.press('Escape')
   check(tag+' close-models',not p.locator('#modelsModal').is_visible())
   p.locator('#homeNewProject').click()
   check(tag+' open-editor',p.locator('#app').is_visible())
   check(tag+' canvas-size',p.locator('#canvas').bounding_box()['width']>=175)
   check(tag+' real-measures',p.evaluate('MAPA_RUNTIME.state.room.w===12 && MAPA_RUNTIME.state.room.h===8'))
   check(tag+' editor-symbol',p.locator('.brand-mark img').evaluate('e=>e.complete&&e.naturalWidth>0'))
   p.locator('#ruler').click()
   check(tag+' ruler-toggle',p.locator('#ruler').get_attribute('aria-pressed')=='true')
   before=p.evaluate('MAPA_RUNTIME.state.cam.zoom')
   p.locator('#zoomIn').click()
   check(tag+' zoom-in',p.evaluate('MAPA_RUNTIME.state.cam.zoom')>before)
   if width in [1440,390,320]:
    p.evaluate('''() => {const model=normalizeModelAreas(MODELOS[0].areas); MAPA_RUNTIME.state.areas=model; MAPA_RUNTIME.state.areaAtiva=model[0].id; updateAreaUI(); fitRoom(); updateUI(); requestDraw()}''')
    p.wait_for_timeout(160)
    p.screenshot(path=str(R/f'qa/editor-{width}.png'))
   if width<=768:
    p.locator('#btnToggleTools').click()
    check(tag+' drawer-open',p.locator('#leftPanel').evaluate('e=>e.classList.contains("mobile-open")'))
    p.keyboard.press('Escape')
    check(tag+' drawer-close',not p.locator('#leftPanel').evaluate('e=>e.classList.contains("mobile-open")'))
   check(tag+' no-exceptions',not errors,errors)
  except Exception as e:
   check(tag+' unhandled-exception',False,str(e))
   print(traceback.format_exc()[-1300:],flush=True)
  finally:
   context.close()
 b.close()
sum_pass=sum(x['passed'] for x in results)
report={'environment':'Chromium locally injected HTML/CSS/JS (not HTTP), localStorage simulated, reduced motion','passed':sum_pass,'total':len(results),'checks':results}
(R/'qa/uiux081-browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('UIUX081 RESULT',sum_pass,'/',len(results),flush=True)
raise SystemExit(0 if sum_pass==len(results) else 1)
