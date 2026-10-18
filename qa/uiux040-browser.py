from pathlib import Path
from playwright.sync_api import sync_playwright
import re,json
ROOT=Path(__file__).resolve().parent.parent
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',(ROOT/'index.html').read_text())
html=html.replace('<link rel="stylesheet" href="css/mapa.css">','')
css=(ROOT/'css/mapa.css').read_text()
scripts=[(ROOT/'js'/n).read_text() for n in ['types.js','geometry.js','validation.js','metric-ruler.js','mapa.js']]
results=[]
def check(n,v,details=''):
    results.append({'name':n,'ok':bool(v),'detail':details});print(('OK  ' if v else 'FAIL')+' '+n+' '+details,flush=True)
def boot(browser,width=1440,height=850):
    context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',accept_downloads=True)
    page=context.new_page();page.set_default_timeout(3500);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='load');page.add_style_tag(content=css)
    page.evaluate('''() => {const mem=new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return mem.get(k)??null},setItem(k,v){mem.set(k,String(v))},removeItem(k){mem.delete(k)},clear(){mem.clear()}}});if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(36).slice(2);}''')
    for script in scripts:page.add_script_tag(content=script)
    page.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))')
    return context,page,errors
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    for width in [320,360,390,414,768,1024,1440]:
        c,p,errs=boot(b,width,710 if width<500 else 850)
        try:
            p.locator('#homeUseModel').click();p.wait_for_timeout(40)
            check(f'{width}_models_open',p.locator('#modelsModal').is_visible())
            check(f'{width}_model_focus',p.evaluate('document.activeElement.closest("#modelsModal") !== null'))
            check(f'{width}_home_inert',p.evaluate('document.querySelector("#homeScreen").inert'))
            if width in [320,390,1440]:p.screenshot(path=str(ROOT/'qa'/f'uiux040-models-{width}px.png'))
            check(f'{width}_model_scroll',p.evaluate('''() => {const r=document.querySelector('#modelsModal .modal-card').getBoundingClientRect();return r.right<=innerWidth+1 && r.left>=-1 && r.bottom<=innerHeight+1 && r.top>=-1}'''))
            # Escape no catálogo aberto da Home devolve o foco ao acionador.
            p.keyboard.press('Escape');p.wait_for_timeout(45)
            check(f'{width}_escape_model_home',not p.locator('#modelsModal').is_visible())
            check(f'{width}_focus_home',p.evaluate('document.activeElement.id === "homeUseModel"'))
            p.locator('#homeNewProject').click()
            # Um objeto existente obriga confirmação antes de substituir o projeto.
            p.evaluate("""()=>{MAPA_RUNTIME.state.areas[0].objetos.push({id:crypto.randomUUID(),type:'bench',x:1,y:1,w:2,h:1,rot:0})}""")
            p.evaluate('openModelsModal()');p.wait_for_timeout(45)
            p.locator('#modelsGrid .model-card').first.click();p.wait_for_timeout(45)
            check(f'{width}_confirm_on_model',p.locator('#confirmModal').is_visible())
            check(f'{width}_nested_model_inert',p.evaluate('document.querySelector("#modelsModal").inert'))
            check(f'{width}_confirm_focus',p.evaluate('document.activeElement.id === "cancelConfirm"'))
            if width in [320,390,1440]:p.screenshot(path=str(ROOT/'qa'/f'uiux040-confirm-{width}px.png'))
            p.locator('#confirmAction').focus()
            p.keyboard.press('Tab')
            check(f'{width}_trap_forward',p.evaluate('document.activeElement.id === "closeConfirm"'))
            p.keyboard.press('Shift+Tab')
            check(f'{width}_trap_reverse',p.evaluate('document.activeElement.id === "confirmAction"'))
            p.keyboard.press('Escape');p.wait_for_timeout(45)
            check(f'{width}_escape_confirm_only',p.locator('#modelsModal').is_visible() and not p.locator('#confirmModal').is_visible())
            check(f'{width}_focus_nested_model',p.evaluate('document.activeElement.closest("#modelsModal") !== null'))
            p.keyboard.press('Escape');p.wait_for_timeout(45)
            check(f'{width}_escape_model_editor',not p.locator('#modelsModal').is_visible())
            # Teclado sem sobreposição nas outras janelas.
            p.locator('#btnShortcuts').click();p.wait_for_timeout(45)
            check(f'{width}_shortcuts_open',p.locator('#shortcutsModal').is_visible())
            check(f'{width}_shortcuts_focus',p.evaluate('document.activeElement.id === "btnCloseShortcuts"'))
            p.keyboard.press('Escape');p.wait_for_timeout(45)
            check(f'{width}_shortcuts_close',not p.locator('#shortcutsModal').is_visible())
            check(f'{width}_shortcuts_restore_focus',p.evaluate('document.activeElement.id === "btnShortcuts"'))
            # report from editor, bypass tab hidden with JS click if mobile panel is closed
            p.evaluate('openComplianceReport()');p.wait_for_timeout(40)
            check(f'{width}_report_open',p.locator('#complianceReportModal').is_visible())
            check(f'{width}_report_focus',p.evaluate('document.activeElement.id === "btnCloseComplianceReport"'))
            check(f'{width}_report_bounds',p.evaluate('''() => {const r=document.querySelector('#complianceReportModal .modal-card').getBoundingClientRect();return r.right<=innerWidth+1 && r.left>=-1 && r.bottom<=innerHeight+1 && r.top>=-1}'''))
            p.locator('#btnCloseComplianceReport').click();p.wait_for_timeout(40)
            check(f'{width}_report_closed',not p.locator('#complianceReportModal').is_visible())
            check(f'{width}_no_errors',not errs,';'.join(errs[:1]))
            if width in [320,390,1440]:p.screenshot(path=str(ROOT/'qa'/f'uiux040-editor-{width}px.png'))
        except Exception as e:check(f'{width}_scenario',False,str(e)[:250])
        finally:c.close()
    c,p,errs=boot(b,1440)
    try:
        p.locator('#homeNewProject').click()
        # fail-close when a modal is unmounted, never execute destructive callback
        v=p.evaluate('''async()=>{const m=document.getElementById('confirmModal');m.remove();let changed=false;const result=await showConfirmModal('Excluir?',()=>{changed=true});return {changed,result}}''')
        check('missing_modal_fails_closed',v=={'changed':False,'result':False})
        # error toasts only accumulate to 3
        p.evaluate('''()=>{for(let i=0;i<20;i++)showToast('Erro '+i,'error')}''')
        check('toast_max_3',p.locator('#toastContainer .toast').count()==3)
        check('toast_error_role',p.locator('#toastContainer .toast[role="alert"]').count()==3)
        check('no_browser_errors',not errs,';'.join(errs[:1]))
    except Exception as e:check('failclose_scenario',False,str(e)[:250])
    finally:c.close()
    # two rapid consecutive attempts must not auto-confirm or replace original
    c,p,errs=boot(b)
    try:
        v=p.evaluate('''async()=>{const calls=[];const p1=showConfirmModal('Primeira',()=>calls.push('one'));const p2=showConfirmModal('Segunda',()=>calls.push('two'));const active=document.getElementById('confirmMessage').textContent;document.getElementById('cancelConfirm').click();return {a:await p1,b:await p2,calls,active}}''')
        check('rapid_dialog_is_safe',v=={'a':False,'b':False,'calls':[],'active':'Primeira'},str(v))
        check('rapid_did_not_leave_overlay',not p.locator('#confirmModal').is_visible())
    except Exception as e:check('rapid_scenario',False,str(e)[:250])
    finally:c.close()
    b.close()
(ROOT/'qa'/'uiux040-browser-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('RESULT',sum(x['ok'] for x in results),'/',len(results),flush=True)
if any(not x['ok'] for x in results):raise SystemExit(1)
