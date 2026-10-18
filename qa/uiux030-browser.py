from pathlib import Path
from playwright.sync_api import sync_playwright
import re,json,math,time
ROOT=Path(__file__).resolve().parent.parent
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',(ROOT/'index.html').read_text())
html=html.replace('<link rel="stylesheet" href="css/mapa.css">','')
css=(ROOT/'css/mapa.css').read_text()
scripts=[(ROOT/'js'/n).read_text() for n in ['types.js','geometry.js','validation.js','metric-ruler.js','mapa.js']]
records=[]
def check(name,condition,desc=''):
 records.append({'name':name,'ok':bool(condition),'detail':desc}); print(('OK   ' if condition else 'FAIL ')+name+(' - '+desc if desc else ''),flush=True)
def boot(browser,width=1440,height=850):
 context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',accept_downloads=True)
 page=context.new_page();errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
 page.set_content(html,wait_until='load');page.add_style_tag(content=css)
 page.evaluate('''() => {const mem=new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return mem.get(k)??null},setItem(k,v){mem.set(k,String(v))},removeItem(k){mem.delete(k)},clear(){mem.clear()}}});if(!crypto.randomUUID)crypto.randomUUID=()=>Math.random().toString(36).slice(2);}''')
 for script in scripts:page.add_script_tag(content=script)
 page.evaluate('window.dispatchEvent(new Event("DOMContentLoaded"))')
 return context,page,errors

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for width in [320,360,390,414,768,1024,1440]:
  context,page,errs=boot(browser,width)
  try:
   page.locator('#homeNewProject').click()
   st=page.evaluate('''()=>({width:MAPA_RUNTIME.state.room.w,height:MAPA_RUNTIME.state.room.h,zoom:MAPA_RUNTIME.state.cam.zoom,objects:MAPA_RUNTIME.state.objects.length})''')
   check('new_project_'+str(width),st['width']==12 and st['height']==8)
   page.locator('#ruler').evaluate('(el)=>el.click()') # mobile panel is offscreen, native click direct
   check('cotas_pressed_'+str(width),page.locator('#ruler').get_attribute('aria-pressed')=='true')
   level=page.evaluate('''()=>MetricRuler.chooseLevel(MAPA_RUNTIME.state.cam.zoom).label''')
   check('initial_marks_'+str(width),level=='1 m',f"{st['zoom']:.1f}px/m; {level}")
   before=page.evaluate('''()=>JSON.stringify(MAPA_RUNTIME.state.areas)''')
   page.evaluate('''()=>{MAPA_RUNTIME.state.cam.zoom=1150;requestDraw()}''')
   page.wait_for_timeout(130)
   level=page.evaluate('''()=>MetricRuler.chooseLevel(MAPA_RUNTIME.state.cam.zoom).label''')
   check('centimeter_'+str(width),level=='1 cm')
   delta=page.evaluate('''()=>{const p=worldToScreen(3.01,2),q=worldToScreen(3,2);return p.x-q.x}''')
   check('centimeter_pixel_spacing_'+str(width),abs(delta-11.5)<.001,f'{delta:.1f}px/cm')
   after=page.evaluate('''()=>JSON.stringify(MAPA_RUNTIME.state.areas)''')
   check('geometry_unchanged_'+str(width),before==after)
   page.evaluate('''()=>{MAPA_RUNTIME.state.cam.x=4.12;MAPA_RUNTIME.state.cam.y=2.73;requestDraw()}''')
   pan=page.evaluate('''()=>{let p=worldToScreen(2,3),q=screenToWorld(p.x,p.y);return {dx:q.x-2,dy:q.y-3}}''')
   check('pan_coordinate_alignment_'+str(width),abs(pan['dx'])<1e-8 and abs(pan['dy'])<1e-8)
   page.evaluate('''()=>{MAPA_RUNTIME.state.cam.zoom=1200;MAPA_RUNTIME.state.cam.x=6;MAPA_RUNTIME.state.cam.y=4;requestDraw()}''')
   page.wait_for_timeout(90)
   if width in [320,390,1440]:
    page.screenshot(path=str(ROOT/'qa'/f'uiux030-cotas-1cm-{width}px.png'))
   page.locator('#ruler').evaluate('(el)=>el.click()')
   check('cotas_off_'+str(width),page.locator('#ruler').get_attribute('aria-pressed')=='false')
   check('no_errors_'+str(width),not errs,(';'.join(errs[:2])) if errs else '')
  except Exception as ex: check('scenario_'+str(width),False,str(ex)[:340])
  finally:context.close()

 # Deliberate 1cm at max zoom via UI actions and wheel
 context,page,errs=boot(browser,1440)
 try:
  page.locator('#homeNewProject').click();page.locator('#ruler').click()
  zoom0=page.evaluate('MAPA_RUNTIME.state.cam.zoom')
  for _ in range(30):page.locator('#zoomIn').click()
  zoom=page.evaluate('MAPA_RUNTIME.state.cam.zoom')
  check('buttons_reach_centimeter',zoom>=1080,f'initial {zoom0:.1f} -> {zoom:.1f} px/m')
  check('buttons_clamped_to_max',zoom<=1200)
  page.locator('#fitRoom').click()
  check('fit_returns',page.evaluate('MAPA_RUNTIME.state.cam.zoom')<220)
  canvas=page.locator('#canvas');box=canvas.bounding_box()
  start=page.evaluate('MAPA_RUNTIME.state.cam.zoom')
  canvas.hover(position={'x':min(200,box['width']*.5),'y':min(200,box['height']*.5)})
  page.mouse.wheel(0,-2500);page.wait_for_timeout(180)
  check('wheel_zoom',page.evaluate('MAPA_RUNTIME.state.cam.zoom')>start)
  check('wheel_still_limits',page.evaluate('MAPA_RUNTIME.state.cam.zoom')<=1200)
  check('ui_no_errors',not errs,(';'.join(errs[:2])) if errs else '')
 finally:context.close()

 # Performance em planta muito maior que o viewport.
 context,page,errs=boot(browser,1440)
 try:
  page.locator('#homeNewProject').click();page.locator('#ruler').click()
  perf=page.evaluate('''() => {
    const s=MAPA_RUNTIME.state;
    s.areas[0].dimensoes.w=10000;s.areas[0].dimensoes.h=10000;
    s.cam.x=5000;s.cam.y=5000;s.cam.zoom=1200;
    const samples=[];
    for(let i=0;i<10;i++){let t=performance.now();draw();samples.push(performance.now()-t);}
    return {avg:samples.reduce((a,b)=>a+b,0)/samples.length,peak:Math.max(...samples)};
  }''')
  check('large_room_viewport_performance',perf['avg']<100 and perf['peak']<250,f"avg={perf['avg']:.1f}ms peak={perf['peak']:.1f}ms")
  check('large_room_no_errors',not errs)
 finally:context.close()

 # Imported JSON dimensions and export unchanged schema
 context,page,errs=boot(browser,1440)
 try:
  page.locator('#homeNewProject').click()
  payload={'version':4,'areas':[{'nome':'Laboratório experimental','tipo':'laboratorio','dimensoes':{'w':18,'h':9},'objetos':[]}]}
  with page.expect_file_chooser() as f:page.locator('#load').click()
  f.value.set_files({'name':'import.json','mimeType':'application/json','buffer':json.dumps(payload).encode()})
  page.wait_for_timeout(130)
  if page.locator('#confirmModal').is_visible():page.locator('#confirmAction').click()
  page.wait_for_timeout(150)
  check('import_geometry',page.evaluate('MAPA_RUNTIME.state.room.w')==18 and page.evaluate('MAPA_RUNTIME.state.room.h')==9)
  page.locator('#ruler').click()
  status=page.evaluate('''()=>{const s=MAPA_RUNTIME.state;return {w:s.room.w,h:s.room.h,level:MetricRuler.chooseLevel(s.cam.zoom).label}}''')
  check('import_ruler_dimensions',status['w']==18 and status['h']==9)
  with page.expect_download() as d:page.locator('#save').click()
  destination=ROOT/'qa'/'uiux030-json-roundtrip.json';d.value.save_as(destination)
  saved=json.loads(destination.read_text())
  check('json_unchanged_schema',set(saved)=={'version','date','areas','areaAtiva'} and 'ruler' not in str(saved))
  check('json_dimensions',saved['areas'][0]['dimensoes']=={'w':18,'h':9})
  with page.expect_download() as d:page.locator('#exportSvg').click()
  svgfile=ROOT/'qa'/'uiux030-svg-export.svg';d.value.save_as(svgfile)
  check('svg_export_ok','<svg' in svgfile.read_text().lower())
  check('import_errors',not errs,(';'.join(errs[:2])) if errs else '')
 except Exception as ex:check('import_scenario',False,str(ex)[:350])
 finally:context.close()
 browser.close()

print('RESULT',sum(r['ok'] for r in records),'/',len(records),flush=True)
(ROOT/'qa'/'uiux030-browser-results.json').write_text(json.dumps(records,indent=2,ensure_ascii=False))
if any(not r['ok'] for r in records): raise SystemExit(1)
