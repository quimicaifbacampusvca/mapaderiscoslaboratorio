from pathlib import Path
from playwright.sync_api import sync_playwright
import re, base64, json, traceback
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()
HTML=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',HTML)
HTML=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',HTML)
for name in ('mrl-symbol.svg','mrl-app-icon.svg'):
 HTML=HTML.replace('assets/svg/'+name,'data:image/svg+xml;base64,'+base64.b64encode((ROOT/'assets/svg'/name).read_bytes()).decode())
CSS='\n'.join((ROOT/'css'/p).read_text() for p in ['mapa.css','identidade-alerta-precisao.css'])
JS=[(ROOT/'js'/p).read_text() for p in ['types.js','geometry.js','validation.js','metric-ruler.js','mapa.js','project-library.js','library-ui.js']]
results=[]
def check(key,okay,detail=''):
 results.append(dict(check=key,passed=bool(okay),detail=str(detail)[:200]))
 if not okay: print('FAIL',key,detail,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1440,900),(390,844),(320,568)]:
  context=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
  p=context.new_page();p.set_default_timeout(6500)
  errors=[];p.on('pageerror',lambda x:errors.append(str(x)))
  tag=str(width)
  try:
   p.set_content(HTML);p.add_style_tag(content=CSS)
   p.add_script_tag(content='''const m=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}});if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(36).slice(2);''')
   p.add_script_tag(content=(ROOT/'qa/fake-indexeddb-test.js').read_text())
   for code in JS:p.add_script_tag(content=code)
   p.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))')
   p.locator('#homeLibrary').click()
   check(tag+' library-dialog',p.locator('#libraryModal').is_visible())
   check(tag+' empty-library',p.locator('.library-empty').count()==1)
   check(tag+' no-horizontal-overflow',p.evaluate('document.documentElement.scrollWidth <= innerWidth+3'))
   p.keyboard.press('Escape')
   check(tag+' close-escape',not p.locator('#libraryModal').is_visible())
   p.locator('#homeNewProject').click()
   check(tag+' editor',p.locator('#app').is_visible())
   p.evaluate('MAPA_RUNTIME.state.room.w=14;MAPA_RUNTIME.persist()')
   p.locator('#librarySaveRevision').click()
   p.wait_for_timeout(50)
   p.locator('#homeBtn').click()
   p.locator('#homeLibrary').click()
   p.wait_for_timeout(80)
   check(tag+' initial-project-saved',p.locator('.library-item').count()==1,p.locator('#libraryList').inner_text())
   p.locator('.library-item button:has-text("Revisões")').click()
   check(tag+' has-revision',p.locator('.library-revisions button').count()==1)
   p.locator('#libraryClose').click()
   p.locator('#homeNewProject').click()
   check(tag+' confirm-on-switch',p.locator('#confirmModal').is_visible())
   p.locator('#confirmAction').click()
   p.wait_for_timeout(80)
   p.locator('#homeBtn').click()
   p.locator('#homeLibrary').click()
   p.wait_for_timeout(100)
   check(tag+' two-projects',p.locator('.library-item').count()==2,p.locator('#libraryList').inner_text())
   p.locator('.library-item button:has-text("Renomear")').first.click()
   form=p.locator('.library-rename-form')
   check(tag+' inline-rename',form.count()==1)
   form.locator('input').fill('Laboratório Experimental')
   form.locator('button:has-text("Salvar nome")').click()
   p.wait_for_timeout(80)
   check(tag+' renamed',p.locator('.library-item-info strong:has-text("Laboratório Experimental")').count()==1)
   if width in (320,390):
    p.locator('#libraryModal').screenshot(path=str(ROOT/f'qa/uiux083-library-{width}.png'))
   check(tag+' no-page-errors',not errors,errors)
  except Exception as e:
   check(tag+' unexpected',False,str(e))
   print(traceback.format_exc()[-1000:],flush=True)
  finally:context.close()
 b.close()
report={'mode':'Chromium with actual HTML/CSS/JS; simulated IndexedDB and localStorage due administrator origin blocks','passed':sum(x['passed'] for x in results),'total':len(results),'checks':results}
(ROOT/'qa/uiux083-browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('UIUX-0.8.3 Browser:',report['passed'],'/',report['total'],flush=True)
raise SystemExit(0 if report['passed']==report['total'] else 1)
