"""Compõe HTML autocontido com os cinco PNGs renderizados pelo Blender Actions."""
from pathlib import Path
import base64, json, sys

viewer = Path(__file__).parent / 'comparativo-visual.html'
render_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('renders')
render_dir.mkdir(parents=True, exist_ok=True)
ids = ('reacao', 'atomica', 'ligacoes', 'ph', 'cristalina')
imgs = {}
for name in ids:
    path = render_dir / f'quimix_{name}.png'
    if not path.is_file() or path.stat().st_size < 500:
        raise SystemExit(f'Render ausente ou invalido: {path}')
    imgs[name] = 'data:image/png;base64,' + base64.b64encode(path.read_bytes()).decode('ascii')

source = viewer.read_text(encoding='utf-8')
script = '''<script>
(function(){
const actual=__RENDERS__;
Object.entries(actual).forEach(([id,uri])=>{
 overrides.set(id,uri);
 const i=THEMES.findIndex(t=>t.id===id);
 if(i>=0)gallery.children[i].querySelector('img').src=uri;
});
$('statusTop').textContent='Cinco renders Blender/Cycles incluídos';
select(0);
$('modeLabel').textContent='RENDER BLENDER / CYCLES';
$('heroNote').textContent='Imagem renderizada no GitHub Actions';
})();
</script>'''.replace('__RENDERS__', json.dumps(imgs, separators=(',', ':')))
source = source.replace('</body>', script + '\n</body>')
out = render_dir / 'QuimiX_Comparativo_Renders_Blender.html'
out.write_text(source, encoding='utf-8')
assert out.stat().st_size > sum((render_dir/f'quimix_{i}.png').stat().st_size for i in ids), 'HTML incompleto'
print('QUIMIX_COMPARATIVO_HTML_OK', out, out.stat().st_size, flush=True)
