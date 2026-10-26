"""Cinco variações renderizadas no Blender Cycles a partir do X original e Quími A (V7).
Saída: cinco .blend editáveis e cinco PNGs de estudo, sem alterar a marca de produção."""
import bpy, sys, math, runpy, shutil, argparse
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('--output',default='renders')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
out=Path(args.output).resolve();out.mkdir(exist_ok=True,parents=True)
base=Path(__file__).resolve().parents[2]/'blender'/'quimix_tipografia_a_v7.py'
assert base.exists(), str(base)
pal={'reacao':('#00E5FF','#FF2A8D','#7B61FF'),
'atomica':('#63C7FF','#FFD166','#47E5BC'),
'ligacoes':('#20C997','#3A86FF','#A8E063'),
'ph':('#EF476F','#9D4EDD','#3A86FF'),
'cristalina':('#5BC0EB','#64DFDF','#7B2CBF')}
def rgba(s):return tuple(int(s[i:i+2],16)/255 for i in (1,3,5))+(1,)
def mat(name,color):
 m=bpy.data.materials.new(name);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=rgba(color)
 p.inputs['Metallic'].default_value=.22;p.inputs['Roughness'].default_value=.22
 if 'Emission Color' in p.inputs:p.inputs['Emission Color'].default_value=rgba(color)
 elif 'Emission' in p.inputs:p.inputs['Emission'].default_value=rgba(color)
 if 'Emission Strength' in p.inputs:p.inputs['Emission Strength'].default_value=1.7
 return m
def ball(name,xyz,r,m,faceted=False):
 if faceted:bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=r,location=xyz)
 else:bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=r,location=xyz)
 o=bpy.context.object;o.name=name;o.data.materials.append(m)
 if not faceted:bpy.ops.object.shade_smooth()
 return o
def wire(name,points,m,r=.018,closed=False):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=3
 sp=c.splines.new('POLY');sp.points.add(len(points)-1)
 for pt,p in zip(sp.points,points):pt.co=(*p,1)
 sp.use_cyclic_u=closed
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);c.materials.append(m)
 return o
def ring(name,center,r,m,scale=.58,slope=.0):
 pts=[(center[0]+r*math.cos(k*math.tau/96),center[1]+scale*r*math.sin(k*math.tau/96),center[2]+slope*r*math.sin(k*math.tau/96)) for k in range(97)]
 return wire(name,pts,m,.013)
for theme,colors in pal.items():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for m in list(bpy.data.materials):bpy.data.materials.remove(m)
 baseout=out/'.base';baseout.mkdir(exist_ok=True)
 original=sys.argv;sys.argv=['blender','--','--output',str(baseout)]
 try:runpy.run_path(str(base),run_name='__main__')
 finally:sys.argv=original
 scene=bpy.context.scene;scene.frame_set(120);scene.render.resolution_x=1120;scene.render.resolution_y=672
 scene.render.engine='CYCLES';scene.cycles.samples=12
 scene.render.image_settings.file_format='PNG';scene.render.resolution_percentage=100
 print('QUIMIX_RENDER_START',theme,'engine',scene.render.engine,'frame',scene.frame_current,flush=True)
 try:scene.cycles.use_denoising=True
 except Exception:pass
 a,b,c=colors;A,B,C=[mat(theme+' '+str(i),color) for i,color in enumerate(colors)]
 for name,color in [('Reagentes | ciano',a),('Produtos | magenta',b),('Conector violeta',c)]:
  m=bpy.data.materials.get(name)
  if m:
   m.diffuse_color=rgba(color)
   n=m.node_tree.nodes.get('Emission')
   if n:n.inputs['Color'].default_value=rgba(color)
 for obj in bpy.data.objects:
  if obj.type=='LIGHT' and obj.data.type=='AREA':
   if 'ciano' in obj.name.lower():obj.data.color=rgba(a)[:3]
   elif 'magenta' in obj.name.lower():obj.data.color=rgba(b)[:3]
 if theme=='reacao':
  for k,r in enumerate([.38,.62,.84]):ring('pulso de reação '+str(k),(0,0,.22),r,C,1)
  for i,(x,y) in enumerate([(-2.55,1.3),(-2.35,-1.2),(2.55,1.25),(2.6,-1.15)]):ball('fluxo reativo '+str(i),(x,y,.58),.12,A if i<2 else B)
 elif theme=='atomica':
  for i,(r,sc,slope) in enumerate([(1.3,.6,.2),(1.58,.47,-.2),(1.88,.58,.1)]):ring('campo eletrônico '+str(i),(0,0,.29),r,A if i!=1 else C,sc,slope)
  for k in range(7):
   ang=k*math.tau/7
   ball('núcleo estilizado '+str(k),(.24*math.cos(ang),.24*math.sin(ang),.68),.074,B,True)
  for k in range(8):
   ang=k*math.tau/8;ball('ponto do campo '+str(k),(1.64*math.cos(ang),.8*math.sin(ang),.62),.052,A)
 elif theme=='ligacoes':
  pts=[(1.2*math.cos(k*math.tau/6),1.2*math.sin(k*math.tau/6),-.08) for k in range(6)]
  for k,p in enumerate(pts):
   ball('nó de ligação '+str(k),p,.12,A if k%2 else B)
   wire('ligação química '+str(k),[p,pts[(k+1)%6]],C,.027)
  for k in range(3):
   wire('ponte de aproximação '+str(k),[(-2.5+k*.37,-1.4,.22),(-2.04+k*.37,-1.08,.22),(-1.7+k*.37,-1.4,.22)],A,.02)
 elif theme=='ph':
  for i,(x,y) in enumerate([(-1.6,1.25),(1.62,1.10),(-1.43,-1.20),(1.48,-1.24)]):
   o=ball('gota de solução '+str(i),(x,y,.57),.17,[A,B,C,A][i]);o.scale=(.74,.74,1.4)
  for k in range(3):
   wire('frente indicadora '+str(k),[(-1.9+3.8*j/86,.17*(k-1)+.20*math.sin(j/86*math.tau+k),.34) for j in range(87)],[A,B,C][k],.020)
 elif theme=='cristalina':
  for i in range(-3,4):
   for j in range(-2,3):
    if (i+j)%2:continue
    x,y=i*.48,j*.48
    ball('retículo '+str(i)+'_'+str(j),(x,y,-.22),.055,A,True)
    if i<3:wire('aresta x '+str(i)+'_'+str(j),[(x,y,-.22),(x+.48,y,-.22)],C,.013)
    if j<2:wire('aresta y '+str(i)+'_'+str(j),[(x,y,-.22),(x,y+.48,-.22)],B,.013)
  for k,(x,y) in enumerate([(-1.75,1.28),(-1.68,-1.3),(1.65,1.3),(1.7,-1.2)]):
   o=ball('faceta prismática '+str(k),(x,y,.64),.24,B if k%2 else C,True);o.scale=(.8,1.5,.9)
 scene.render.filepath=str(out/('quimix_'+theme+'.png'))
 bpy.ops.wm.save_as_mainfile(filepath=str(out/('QuimiX_'+theme.upper()+'.blend')))
 bpy.ops.render.render(write_still=True)
 print('QUIMIX_RENDER_OK',theme,scene.render.filepath)
 shutil.rmtree(baseout,ignore_errors=True)
print('QUIMIX_FIVE_DONE')
