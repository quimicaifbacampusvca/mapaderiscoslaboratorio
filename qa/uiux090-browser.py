"""Prova funcional de quota com JS real e IndexedDB simulado. Não homologa PWA real."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, base64, json, traceback
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
HTML=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',HTML)
HTML=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',HTML)
for name in ['mrl-symbol.svg','mrl-app-icon.svg']:
    file=ROOT/'assets/svg'/name
    HTML=HTML.replace('assets/svg/'+name,'data:image/svg+xml;base64,'+base64.b64encode(file.read_bytes()).decode())
CSS='\n'.join((ROOT/'css'/n).read_text(encoding='utf-8') for n in ['mapa.css','identidade-alerta-precisao.css'])
SCRIPTS=[(ROOT/'js'/n).read_text(encoding='utf-8') for n in ['types.js','geometry.js','validation.js','metric-ruler.js','mapa.js','project-library.js','library-ui.js']]
results=[]
def check(name,ok,detail=''):
    results.append({'check':name,'passed':bool(ok),'detail':str(detail)[:180]})
    if not ok:print('FAILED',name,detail,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for w,h in [(1440,900),(390,844),(320,568)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},accept_downloads=True)
        page=ctx.new_page();page.set_default_timeout(5000);errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        try:
            page.set_content(HTML);page.add_style_tag(content=CSS)
            page.add_script_tag(content='''
              window.__quota=false;
              const backing=new Map();
              Object.defineProperty(window,'localStorage',{configurable:true,value:{
                getItem:k=>backing.get(k)??null,
                setItem:(k,v)=>{if(window.__quota)throw Error('QuotaExceededError');backing.set(k,String(v));},
                removeItem:k=>backing.delete(k)
              }});
              if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(36).slice(2);
            ''')
            page.add_script_tag(content=(ROOT/'qa/fake-indexeddb-test.js').read_text(encoding='utf-8'))
            for script in SCRIPTS:page.add_script_tag(content=script)
            page.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))')
            page.locator('#homeNewProject').click()
            check(f'{w} editor',page.locator('#app').is_visible())
            # Estabelecer id da biblioteca com armazenamento inicialmente íntegro.
            page.evaluate('MAPA_RUNTIME.state.room.w=14; MAPA_RUNTIME.persist()')
            page.wait_for_timeout(150)
            before=page.evaluate('''async()=>{const id=MAPA_LIBRARY_RUNTIME.currentId;return (await MapaProjectLibrary.load(id))?.payload.areas[0].dimensoes.w}''')
            check(f'{w} initial IDB persisted',before==14,before)
            # Simula localStorage cheio, mas IndexedDB continua disponível.
            failed=page.evaluate('''()=>{window.__quota=true; MAPA_RUNTIME.state.room.w=18;return MAPA_RUNTIME.persist()}''')
            check(f'{w} local storage failure explicit',failed is False)
            page.wait_for_timeout(180)
            saved=page.evaluate('''async()=>{const id=MAPA_LIBRARY_RUNTIME.currentId;return (await MapaProjectLibrary.load(id))?.payload.areas[0].dimensoes.w}''')
            check(f'{w} IndexedDB fallback manual',saved==18,saved)
            # Uma revisão também deve ser gravada mesmo se persistDraftNow falhar.
            page.locator('#librarySaveRevision').click()
            page.wait_for_timeout(150)
            revisions=page.evaluate('''async()=>{return (await MapaProjectLibrary.revisions(MAPA_LIBRARY_RUNTIME.currentId)).length}''')
            check(f'{w} revision despite quota',revisions==1,revisions)
            page.evaluate('MAPA_RUNTIME.state.room.w=19; scheduleAutoSave()')
            page.wait_for_timeout(1050)
            saved=page.evaluate('''async()=>{const id=MAPA_LIBRARY_RUNTIME.currentId;return (await MapaProjectLibrary.load(id))?.payload.areas[0].dimensoes.w}''')
            check(f'{w} IndexedDB fallback timer',saved==19,saved)
            check(f'{w} browser errors',not errors,errors)
        except Exception as e:
            check(f'{w} exception',False,str(e));print(traceback.format_exc()[-1200:],flush=True)
        finally:ctx.close()
    browser.close()
report={'mode':'Chromium / página isolada / IndexedDB simulado; não prova persistência nativa nem PWA real', 'passed':sum(x['passed'] for x in results),'total':len(results),'checks':results}
(ROOT/'qa/uiux090-browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'UIUX-0.9.0 navegador: {report["passed"]}/{report["total"]}',flush=True)
raise SystemExit(0 if report['passed']==report['total'] else 1)
