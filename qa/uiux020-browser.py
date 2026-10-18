from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',(ROOT/'index.html').read_text())
html=re.sub(r'<link rel="stylesheet" href="css/mapa.css">','',html)
css=(ROOT/'css/mapa.css').read_text()
scripts=[(ROOT/'js'/s).read_text() for s in ['types.js','geometry.js','validation.js','mapa.js']]
results=[]

def setup(browser,width=1440,pre=None,block_storage=False):
 context=browser.new_context(viewport={'width':width,'height':850},accept_downloads=True,reduced_motion='reduce')
 page=context.new_page(); errs=[]
 page.on('pageerror',lambda e:errs.append(str(e)))
 page.set_content(html,wait_until='load');page.add_style_tag(content=css)
 page.evaluate('''({entries,blocked})=>{const store = new Map(entries||[]);Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>{if(blocked)throw Error('SecurityError');return store.has(k)?store.get(k):null},setItem:(k,v)=>{if(blocked)throw Error('QuotaExceededError');store.set(k,String(v))},removeItem:k=>store.delete(k),clear:()=>store.clear(),dump:()=>[...store.entries()]}});if(!crypto.randomUUID)crypto.randomUUID=()=>String(Math.random()).slice(2);}''',dict(entries=list((pre or {}).items()),blocked=block_storage))
 for s in scripts:page.add_script_tag(content=s)
 page.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))')
 return context,page,errs

def check(name,pass_,detail=''):
 results.append((name,bool(pass_),detail));print(('PASS ' if pass_ else 'FAIL ')+name+(' '+detail if detail else ''))

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 # first use, after edit, cancel, backup, recover
 for width in [320,390,768,1440]:
  c,p,e=setup(browser,width)
  try:
   p.locator('#homeNewProject').click()
   check('new_clean_'+str(width),p.locator('#app').is_visible() and not p.locator('#confirmModal').is_visible(),str(p.evaluate('MAPA_RUNTIME.state.areas[0].dimensoes.w')))
   p.evaluate("MAPA_RUNTIME.state.areas[0].nome='Projeto estudantil importante';scheduleAutoSave()")
   p.wait_for_timeout(930)
   p.locator('#homeBtn').click()
   p.locator('#homeNewProject').click()
   check('prompts_existing_'+str(width),p.locator('#confirmModal').is_visible())
   p.locator('#cancelConfirm').click()
   p.wait_for_timeout(180)
   check('cancel_preserves_'+str(width),p.evaluate('MAPA_RUNTIME.state.areas[0].nome')=='Projeto estudantil importante' and 'Projeto estudantil importante' in p.evaluate('localStorage.getItem("mapa_riscos_autosave")'))
   p.locator('#homeNewProject').click()
   with p.expect_download(timeout=4000) as dl:p.locator('#confirmBackup').click()
   data=dl.value
   savepath=ROOT/'qa'/'test-previous-download.json';data.save_as(savepath); json_s=json.loads(savepath.read_text());
   check('export_before_discard_'+str(width),json_s['areas'][0]['nome']=='Projeto estudantil importante')
   p.locator('#confirmAction').click()
   p.wait_for_timeout(180)
   check('replace_and_backup_'+str(width),p.evaluate('MAPA_RUNTIME.state.areas[0].nome')=='Laboratório' and 'Projeto estudantil importante' in p.evaluate('localStorage.getItem("mapa_riscos_previous_autosave")'))
   p.locator('#homeBtn').click()
   check('backup_visible_'+str(width),p.locator('#previousProjectRow').is_visible())
   p.locator('#homeRestorePrevious').click();check('restore_backup_prompts_'+str(width),p.locator('#confirmModal').is_visible()==False or p.locator('#confirmModal').is_visible())
   if p.locator('#confirmModal').is_visible():p.locator('#confirmAction').click()
   p.wait_for_timeout(180)
   check('restore_success_'+str(width),p.evaluate('MAPA_RUNTIME.state.areas[0].nome')=='Projeto estudantil importante')
   check('no_old_logout_'+str(width),p.locator('#logoutBtn').count()==0)
   check('no_fatal_js_'+str(width),not e,';'.join(e[:1]))
  except Exception as ex:check('scenario_exception_'+str(width),False,str(ex)[:250])
  finally:c.close()
 # robust invalid json and blocked storage
 c,p,e=setup(browser,pre={'mapa_riscos_autosave':'{BAD'})
 try:
  check('corrupt_hidden_continue',not p.locator('#recentProjects').is_visible() and p.locator('#homeStorageWarning').is_visible())
  p.locator('#homeNewProject').click()
  check('corrupt_prompts',p.locator('#confirmModal').is_visible())
  p.locator('#cancelConfirm').click();p.wait_for_timeout(190)
  check('corrupt_remains_untouched',p.evaluate('localStorage.getItem("mapa_riscos_autosave")')=='{BAD')
 finally:c.close()
 c,p,e=setup(browser,block_storage=True)
 try:
  p.locator('#homeNewProject').click()
  check('storage_block_message',p.locator('#homeStorageWarning').is_visible() and p.locator('#confirmModal').is_visible())
  p.locator('#confirmAction').click()
  check('storage_fail_keeps_home',p.locator('#homeScreen').is_visible())
 finally:c.close()
 # valid & malformed import
 c,p,e=setup(browser)
 try:
  p.locator('#homeNewProject').click()
  p.evaluate("MAPA_RUNTIME.state.areas[0].nome='Precisa ficar';scheduleAutoSave()")
  p.wait_for_timeout(850);p.locator('#homeBtn').click()
  with p.expect_file_chooser() as f:p.locator('#homeOpenProject').click()
  f.value.set_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{ERROR'})
  p.wait_for_timeout(180)
  check('malformed_import_no_loss',p.evaluate('MAPA_RUNTIME.state.areas[0].nome')=='Precisa ficar')
  payload={'version':4,'areas':[{'nome':'Outra planta','tipo':'laboratorio','dimensoes':{'w':10,'h':7},'objetos':[]}]}
  with p.expect_file_chooser() as f:p.locator('#homeOpenProject').click()
  f.value.set_files({'name':'valid.json','mimeType':'application/json','buffer':json.dumps(payload).encode()})
  p.wait_for_timeout(190)
  check('import_prompts_replacement',p.locator('#confirmModal').is_visible())
  p.locator('#cancelConfirm').click();p.wait_for_timeout(180)
  check('import_cancel_no_loss',p.evaluate('MAPA_RUNTIME.state.areas[0].nome')=='Precisa ficar')
  with p.expect_file_chooser() as f:p.locator('#homeOpenProject').click()
  f.value.set_files({'name':'valid.json','mimeType':'application/json','buffer':json.dumps(payload).encode()})
  p.wait_for_timeout(160)
  p.locator('#confirmAction').click();p.wait_for_timeout(140)
  check('import_replace',p.evaluate('MAPA_RUNTIME.state.areas[0].nome')=='Outra planta' and p.locator('#app').is_visible())
 except Exception as ex:check('import_exception',False,str(ex)[:350])
 finally:c.close()
 browser.close()

print('TOTAL',sum(v for _,v,_ in results),'/',len(results))
(ROOT/'qa'/'qa-results.json').write_text(json.dumps([{'name':n,'pass':p,'detail':d} for n,p,d in results],ensure_ascii=False,indent=2))
if not all(v for _,v,_ in results):raise SystemExit(1)
