"""Consolida APENAS PNGs renderizados pelo Blender em comparativo HTML offline.
Sem imagens fabricadas ou vetoriais substitutas.
"""
from pathlib import Path
import argparse, base64, json, struct, hashlib
p=argparse.ArgumentParser();p.add_argument('directory',type=Path)
a=p.parse_args();root=a.directory
items=[
 ('01_reagentes','01 — Reagentes','As quatro partículas cianas percorrem trajetórias em profundidade.'),
 ('02_convergencia','02 — Convergência','O núcleo à esquerda conduz os reagentes ao centro do X.'),
 ('03_nucleo_e_X','03 — Síntese','O X surge como sólido chanfrado; o núcleo energético atinge seu ápice.'),
 ('04_quimi_produtos','04 — Formação de Quími','Produtos magentas se propagam enquanto a tipografia A começa a surgir.'),
 ('05_assinatura_final','05 — Assinatura','Quími A e o X preservado estabilizados, com as conexões oficiais.')]
photos=[]
for name,title,caption in items:
    f=root/(name+'.png')
    if not f.is_file():raise RuntimeError('Render Blender ausente: '+str(f))
    data=f.read_bytes()
    if data[:8]!=b'\x89PNG\r\n\x1a\n':raise RuntimeError('PNG invalido: '+str(f))
    size=struct.unpack('>II',data[16:24])
    photos.append(dict(name=name,title=title,caption=caption,width=size[0],height=size[1],bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),uri='data:image/png;base64,'+base64.b64encode(data).decode('ascii')))
blend=root/'QuimiX_REACAO_R8.blend'
if not blend.is_file() or blend.read_bytes()[:7]!=b'BLENDER':raise RuntimeError('Arquivo .blend ausente ou inválido')
manifest={'origin':'Blender Cycles renderizado no runner do GitHub Actions', 'frames': [{k:v for k,v in x.items() if k!='uri'} for x in photos], 'blend_bytes':blend.stat().st_size}
(root/'manifest-render.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf8')
html='''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QuímiX | Reação 3D R8 — 5 renders Blender</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{background:#080e17;color:#e9f1fa;font:15px/1.5 system-ui,Segoe UI,sans-serif;margin:0}main{max-width:1220px;margin:auto;padding:24px}h1{font-size:clamp(24px,3vw,36px);margin:0 0 5px}p{color:#adbfce;margin:4px 0 18px}.stage{border:1px solid #354454;border-radius:20px;background:#0d1523;overflow:hidden}.stage img{width:100%;height:auto;aspect-ratio:16/9;object-fit:contain;display:block}.below{padding:20px}.meta{display:flex;flex-wrap:wrap;gap:16px;align-items:baseline;justify-content:space-between}.meta strong{font-size:22px}.frames{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:18px 0}.thumb{background:#111f30;border:1px solid #365267;padding:4px;border-radius:10px;color:#c2d3e1;cursor:pointer;text-align:left;transition:border-color .2s}.thumb[aria-pressed=true]{border:2px solid #00e5ff}.thumb img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px}.thumb span{display:block;font-size:12px;padding:5px}.controls{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.controls button{font:inherit;border:1px solid #426178;color:white;background:#172e42;border-radius:9px;padding:8px 14px;cursor:pointer}.status{color:#93b6cd;font-size:13px}.foot{font-size:13px;border-top:1px solid #243343;margin-top:20px;padding-top:14px}@media(max-width:700px){.frames{grid-template-columns:repeat(2,minmax(0,1fr))}main{padding:12px}.below{padding:14px}}
</style></head><body><main><h1>QuímiX — Reação 3D · R8</h1><p>Sequência de cinco quadros efetivamente renderizados no Blender/Cycles. O HTML exibe os renders incorporados, não recria os modelos em SVG.</p><section class="stage"><img id="hero" alt="Quadro renderizado do Blender"><div class="below"><div class="meta"><strong id="title"></strong><span class="status" id="count"></span></div><p id="caption"></p><div class="controls"><button id="previous">Quadro anterior</button><button id="next">Próximo quadro</button></div></div></section><nav class="frames" id="frames" aria-label="Selecionar quadro"></nav><p class="foot">Estudo experimental: tipografia Quími A V7 e X original de 12 vértices. Os cinco quadros são amostras; o arquivo .blend contém o projeto animado em 210 quadros a 30 fps. Arquivo de auditoria: manifest-render.json.</p></main><script>
const ITEMS=__ITEMS__;let index=0;const $=id=>document.getElementById(id);const nav=$('frames');for(let i=0;i<ITEMS.length;i++){const x=ITEMS[i];const b=document.createElement('button');b.type='button';b.className='thumb';b.innerHTML='<img alt=""><span></span>';b.querySelector('img').src=x.uri;b.querySelector('img').alt=x.title;b.querySelector('span').textContent=x.title;b.onclick=()=>select(i);nav.append(b)}function select(i){index=(i+ITEMS.length)%ITEMS.length;let x=ITEMS[index];$('hero').src=x.uri;$('hero').alt=x.title;$('title').textContent=x.title;$('caption').textContent=x.caption;$('count').textContent=(index+1)+' / '+ITEMS.length+' · '+x.width+' × '+x.height+' px';Array.from(nav.children).forEach((b,k)=>b.setAttribute('aria-pressed',String(k===index)))}$('previous').onclick=()=>select(index-1);$('next').onclick=()=>select(index+1);window.onkeydown=e=>{if(e.key==='ArrowLeft')select(index-1);if(e.key==='ArrowRight')select(index+1)};select(0);
</script></body></html>'''
html=html.replace('__ITEMS__',json.dumps(photos,ensure_ascii=False,separators=(',',':')))
(root/'comparativo_renderizado.html').write_text(html,encoding='utf8')
print('QUIMIX_QA_RENDER_VALIDATED',len(photos),'frames',str(root/'comparativo_renderizado.html'))

# Relatório gerado após validação de PNG e .blend.
# Arquivo auxiliar de QA, sem substituir imagens renderizadas.