import importlib.util,json
from pathlib import Path
# copying snippet but avoid executing imported script
from playwright.sync_api import sync_playwright
import re
root=Path(__file__).resolve().parent.parent
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',(root/'index.html').read_text())
html=re.sub(r'<link rel="stylesheet" href="css/mapa.css">','',html)
css=(root/'css/mapa.css').read_text();ss=[(root/'js'/f).read_text() for f in ['types.js','geometry.js','validation.js','mapa.js']]
def setup(browser,pre=None):
 c=browser.new_context(viewport={'width':1024,'height':768},accept_downloads=True)
 p=c.new_page();e=[];p.on('pageerror',lambda er:e.append(str(er)));p.set_content(html);p.add_style_tag(content=css)
 p.evaluate('''pre=>{const d=new Map(pre||[]);Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d.has(k)?d.get(k):null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),dump:()=>[...d.entries()]}});if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(36).slice(2)}''',list((pre or {}).items()))
 for s in ss:p.add_script_tag(content=s)
 p.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))')
 return c,p,e
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
 c,p,e=setup(b)
 p.locator('#homeNewProject').click();p.evaluate("MAPA_RUNTIME.state.areas[0].nome='Lab mantido';scheduleAutoSave()");p.wait_for_timeout(900)
 p.locator('#homeBtn').click();p.locator('#homeUseModel').click();p.locator('#modelsGrid [data-model-id]').first.click();print('model_prompt',p.locator('#confirmModal').is_visible());p.locator('#cancelConfirm').click();p.wait_for_timeout(180);print('model_cancel_preserved',p.evaluate('MAPA_RUNTIME.state.areas[0].nome'))
 p.locator('#modelsGrid [data-model-id]').first.click();p.locator('#confirmAction').click();p.wait_for_timeout(200);print('model_objects',p.evaluate('MAPA_RUNTIME.state.areas[0].objetos.length'))
 print('model_errors',e)
 p.evaluate("MAPA_RUNTIME.state.areas[0].nome='Persistir';scheduleAutoSave()");p.wait_for_timeout(900);raw=dict(p.evaluate('localStorage.dump()'));c.close()
 c2,p2,e2=setup(b,raw)
 print('reload_home_continue',p2.locator('#recentProjects').is_visible());p2.locator('#homeContinue').click();print('reload_restored',p2.evaluate('MAPA_RUNTIME.state.areas[0].nome'));print('reload_errors',e2)
 c2.close();b.close()
