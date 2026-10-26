"""QuímiX Reação R8 — cena Blender 3D real, 210 frames/30 fps.

Geometria: contorno de doze vértices do X e sua topologia interna do SVG
original do programa; curvas de letras Q-u-ı-m-i da tipografia experimental A V7.
Os 5 PNG são renderizados a partir do .blend nesta mesma execução.

Blender (3.4+):
 blender -b --factory-startup -t 4 --python reacao_3d_refinada.py -- --output renders
Sem bibliotecas externas. A cena não afirma simular uma reação química real.
"""
import bpy
import math
import sys
import argparse
from pathlib import Path
from mathutils import Vector

p = argparse.ArgumentParser()
p.add_argument('--output', default='renders')
p.add_argument('--samples', type=int, default=24)
p.add_argument('--resolution', type=int, default=1152)
p.add_argument('--quick', action='store_true', help='Criar o .blend sem renderizar imagens')
a = p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
out = Path(a.output).resolve(); out.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
sc = bpy.context.scene
sc.frame_start=1; sc.frame_end=210; sc.render.fps=30
sc.render.engine='CYCLES'; sc.cycles.samples=a.samples
sc.render.resolution_x=a.resolution; sc.render.resolution_y=round(a.resolution*9/16)
sc.render.resolution_percentage=100
sc.render.image_settings.file_format='PNG'; sc.render.film_transparent=False
try: sc.cycles.use_denoising = True
except AttributeError: pass
sc.view_settings.view_transform = 'Standard'
sc.view_settings.look = 'Medium High Contrast'
sc.view_settings.exposure=0
world=bpy.data.worlds.new('Estúdio | azul grafite')
world.use_nodes=True
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.006,.010,.025,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.55
sc.world=world

THEME={
 'reagent': '#00E5FF', 'product':'#FF2A8D', 'transient':'#7B61FF',
 'graphite':'#232A34', 'silver':'#DCEAF4', 'bond':'#8192A5'
}

def rgb(s):
 s=s.lstrip('#'); return tuple(int(s[i:i+2],16)/255 for i in (0,2,4))
def rgba(s):return (*rgb(s),1)
def shader(name,color,metallic=.0,roughness=.3,emission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True
 pr=m.node_tree.nodes.get('Principled BSDF')
 pr.inputs['Base Color'].default_value=rgba(color)
 pr.inputs['Metallic'].default_value=metallic
 pr.inputs['Roughness'].default_value=roughness
 if 'Emission Color' in pr.inputs:pr.inputs['Emission Color'].default_value=rgba(color)
 elif 'Emission' in pr.inputs:pr.inputs['Emission'].default_value=rgba(color)
 if 'Emission Strength' in pr.inputs:pr.inputs['Emission Strength'].default_value=emission
 m.diffuse_color=rgba(color)
 return m

GRAPH=shader('X | grafite metálico',THEME['graphite'],.8,.23)
SILVER=shader('Quími A | prata acetinada',THEME['silver'],.55,.21)
BOND=shader('Ligações | aço escovado',THEME['bond'],.72,.25)
CYAN=shader('Reagentes | ciano luminoso',THEME['reagent'],.18,.18,2.4)
MAGENTA=shader('Produtos | magenta luminoso',THEME['product'],.18,.18,2.2)
VIOLET=shader('Núcleo | violeta',THEME['transient'],.2,.24,2)
WHITE=shader('Síntese | branco frio','#F1FFFF',.12,.13,4.5)
EDGE_CY=shader('Friso X | ciano',THEME['reagent'],.25,.17,1.8)
EDGE_MG=shader('Friso X | magenta',THEME['product'],.25,.17,1.8)
DARK=shader('Extrusão tipográfica | grafite','#233241',.75,.24)
GRID=shader('Grid sutil','#24354E',.5,.7,.03)

# Posicionamento preserva as distâncias relativas do SVG original (900x650).
# xOffset deixa o X à direita da palavra Quími A.
def Xp(p,z=.2):return ((p[0]-450)*.0068+1.9,(325-p[1])*.0068,z)
def Wp(p,z=.24):return (-5.75+(p[0]-22)*.0080,(125-p[1])*.0102,z)
def key(obj,prop,frames):
 for f,value in frames:
  setattr(obj,prop,value);obj.keyframe_insert(data_path=prop,frame=f)

def ease_interp(id_owner):
 if id_owner.animation_data and id_owner.animation_data.action:
  for fcu in id_owner.animation_data.action.fcurves:
   for k in fcu.keyframe_points:k.interpolation='BEZIER'

def tube(name,pts,material,radius=.017,begin=1,finish=1,z=.25,closed=False, coords=Xp):
 cv=bpy.data.curves.new(name,'CURVE');cv.dimensions='3D';cv.resolution_u=20
 cv.bevel_depth=radius;cv.bevel_resolution=3;cv.use_fill_caps=True
 sp=cv.splines.new('POLY');sp.points.add(len(pts)-1)
 for cp,p in zip(sp.points,pts):cp.co=(*coords(p,z),1)
 sp.use_cyclic_u=closed
 ob=bpy.data.objects.new(name,cv);bpy.context.collection.objects.link(ob)
 cv.materials.append(material)
 if begin!=finish:
  for f,value in [(1,0.001),(begin,0.001),(finish,1),(210,1)]:
   cv.bevel_factor_end=value;cv.keyframe_insert(data_path='bevel_factor_end',frame=f)
  ease_interp(cv)
 return ob

def ring(name,center,r,material,begin,finish,z=.3):
 rp=r/.0068  # raio em unidades Blender → coordenadas do SVG
 pts=[(center[0]+rp*math.cos(i*math.tau/80),center[1]+rp*math.sin(i*math.tau/80)) for i in range(81)]
 return tube(name,pts,material,.010,begin,finish,z,closed=True)

def ball(name,pt,material,rad=.08,begin=1,finish=1, z=.4, final=1, path=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,radius=rad,location=Xp(pt,z))
 ob=bpy.context.object;ob.name=name
 ob.data.materials.append(material)
 bpy.ops.object.shade_smooth()
 frames=[(1,.001),(max(1,begin-2),.001),(begin,1),(finish,final),(210,final)]
 for f,v in frames:
  ob.scale=(v,v,v);ob.keyframe_insert(data_path='scale',frame=f)
 if path:
  for f,point in path:
   ob.location=Xp(point,z);ob.keyframe_insert(data_path='location',frame=f)
 ease_interp(ob)
 return ob

def marker(name,frame):sc.timeline_markers.new(name,frame=frame)
for nm,fr in [('01 matéria / entrada',1),('02 reagentes convergem',36),('03 síntese no X',84),('04 produtos se formam',125),('05 Quími A surge',138),('06 estabilização',192),('07 assinatura',210)]:marker(nm,fr)

# CORPO EXTRUDADO — contorno oficial X de 12 vértices (não duas barras).
X=[(265,100),(370,100),(450,270),(530,100),(635,100),(495,325),
   (635,550),(530,550),(450,380),(370,550),(265,550),(405,325)]
front_z=.33; back_z=.06
front=[Xp(p,front_z) for p in X]; back=[Xp(p,back_z) for p in X]
verts=front+back
n=len(X)
faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
mesh=bpy.data.meshes.new('X | mesh 12 vértices e faces laterais');mesh.from_pydata(verts,[],faces);mesh.update()
body=bpy.data.objects.new('X | sólido chanfrado em grafite',mesh);bpy.context.collection.objects.link(body)
mesh.materials.append(GRAPH)
bev=body.modifiers.new('Chanfro físico 3D','BEVEL');bev.width=.035;bev.segments=3
if hasattr(bev,'affect'):bev.affect='EDGES'
bevel_normals=body.modifiers.new('Normais ponderadas','WEIGHTED_NORMAL');bevel_normals.keep_sharp=True
for polygon in mesh.polygons: polygon.use_smooth=True
for f,v in [(1,.001),(79,.001),(95,.21),(115,.76),(128,1.02),(145,1),(210,1)]:
 body.scale=(v,v,v);body.keyframe_insert(data_path='scale',frame=f)
ease_interp(body)

# Bordas cromáticas percorrem o X na síntese e depois recuam.
for i,(p1,p2) in enumerate(zip(X, X[1:]+X[:1])):
 mid=(p1[0]+p2[0])*0.5
 material=EDGE_CY if mid<450 else EDGE_MG
 obj=tube('X | friso iluminado %02d'%i,[p1,p2],material,.010,begin=94+(i%3)*3,finish=120+(i%3)*3,z=.35)
 for f,val in [(1,0),(95,0),(126,1),(170,.65),(191,.22),(210,.22)]:
  obj.scale=(val,val,val);obj.keyframe_insert(data_path='scale',frame=f)

# A rede molecular permanece como geometria separada e reconhecível.
left=[
 ('entrada superior',[(110,210),(200,210)],10,32),
 ('entrada inferior',[(110,440),(200,440)],12,35),
 ('convergente superior',[(200,210),(245,310),(260,325)],24,68),
 ('convergente inferior',[(200,440),(245,340),(260,325)],27,70),
 ('ponte ao núcleo',[(260,325),(433,325)],57,92)]
for name,pts,st,en in left:tube('Reagentes | '+name,pts,BOND,.018,st,en)
for i,(pt,r) in enumerate([((110,210),.112),((200,210),.112),((110,440),.090),((200,440),.112)]):ring('Reagentes | anel %02d'%i,pt,r,BOND,18+i*3,44+i*3)
ring('Reagentes | núcleo externo',(260,325),.176,BOND,35,77)
ring('Reagentes | núcleo interno',(260,325),.104,BOND,36,78)
ball('Reagentes | nó violeta',(260,325),VIOLET,.062,78,86,final=1)
inner=[((380,180),(433,325)),((380,470),(433,325)),((467,325),(520,180)),((467,325),(520,470))]
for i,(p1,p2) in enumerate(inner):tube('X | ligação interna %02d'%i,[p1,p2],BOND,.017,100+i*5,133+i*5,z=.35)
for i,(pt,material) in enumerate([((380,180),CYAN),((380,470),CYAN),((433,325),CYAN),((467,325),MAGENTA),((520,180),MAGENTA),((520,470),MAGENTA)]):
 ball('X | nó interno oficial %02d'%i,pt,material,.065,118+i*5,140+i*3,z=.43)
right=[
 ('eixo',[(467,325),(575,325)],123,143),
 ('ramificação superior',[(575,325),(535,260)],132,152),
 ('ramificação inferior',[(575,325),(535,390)],135,155),
 ('ligação dupla superior',[(585,319),(640,319)],144,164),
 ('ligação dupla inferior',[(585,331),(640,331)],145,165),
 ('terminal alto',[(640,325),(720,210)],153,173),
 ('terminal baixo',[(640,325),(720,440)],153,174)]
for name,pts,st,en in right:tube('Produtos | '+name,pts,BOND,.017,st,en)
ring('Produtos | anel alto',(720,210),.112,BOND,163,180)
ring('Produtos | anel baixo',(720,440),.088,BOND,162,182)

# NÚCLEO REACIONAL não é nó definitivo: retrai após a síntese.
flash=ball('TRANSIÇÃO | núcleo de síntese',(450,325),WHITE,.28,90,102,z=.5,final=.001)
for fr,val in [(1,.001),(84,.001),(92,.5),(107,1.45),(124,.78),(148,.001),(210,.001)]:
 flash.scale=(val,val,val);flash.keyframe_insert(data_path='scale',frame=fr)
for k,r in enumerate((.22,.43,.65)):
 pulse=ring('TRANSIÇÃO | onda de energia %02d'%k,(450,325),r,[CYAN,VIOLET,MAGENTA][k],94+k*5,117+k*5,z=.45)
 for f,v in [(1,.001),(94+k*5,.001),(112+k*5,1),(138+k*5,.001),(210,.001)]:
  pulse.scale=(v,v,v);pulse.keyframe_insert(data_path='scale',frame=f)

# Trajetórias de partículas móveis — chegada dos reagentes antes dos produtos.
reagents=[
 [(9,(110,210)),(32,(200,210)),(58,(245,310)),(78,(260,325)),(93,(433,325)),(101,(450,325))],
 [(14,(200,210)),(46,(245,310)),(73,(260,325)),(96,(433,325)),(103,(450,325))],
 [(12,(110,440)),(37,(200,440)),(61,(245,340)),(82,(260,325)),(96,(433,325)),(104,(450,325))],
 [(18,(200,440)),(50,(245,340)),(76,(260,325)),(98,(433,325)),(105,(450,325))]]
for i,path in enumerate(reagents):
 ob=ball('ANIMADO | reagente ciano %02d'%i,path[0][1],CYAN,.10+i*.007,path[0][0],path[-1][0],path=path,final=.001,z=.48)
 for f,v in [(path[-1][0]-3,1),(path[-1][0]+6,.001),(210,.001)]:
  ob.scale=(v,v,v);ob.keyframe_insert(data_path='scale',frame=f)
 # trilha acende com atraso, não é mero elemento decorativo
 for j in range(len(path)-1):
  tube('ANIMADO | trilha reagente %02d-%d'%(i,j),[path[j][1],path[j+1][1]],CYAN,.008,
       begin=path[j][0],finish=path[j+1][0],z=.36)
products=[
 [(115,(450,325)),(133,(467,325)),(153,(520,180))],
 [(119,(450,325)),(136,(467,325)),(159,(520,470))],
 [(122,(450,325)),(143,(575,325)),(167,(640,325)),(181,(720,210))],
 [(125,(450,325)),(148,(575,325)),(168,(640,325)),(184,(720,440))]]
for i,path in enumerate(products):
 ob=ball('ANIMADO | produto magenta %02d'%i,path[0][1],MAGENTA,.09+i*.005,path[0][0],path[-1][0],path=path,final=.001,z=.46)
 for f,v in [(path[-1][0]-1,1),(min(path[-1][0]+12,200),.001),(210,.001)]:
  ob.scale=(v,v,v);ob.keyframe_insert(data_path='scale',frame=f)
 for j in range(len(path)-1):
  tube('ANIMADO | trilha produto %02d-%d'%(i,j),[path[j][1],path[j+1][1]],MAGENTA,.008,
       begin=path[j][0],finish=path[j+1][0],z=.37)

# QUÍMI A — 5 glifos vetoriais próprios aprovados na V7 (Q,u,í,m,i).
# São curvas Bézier de geometria real, com volume cilíndrico e profundidade.
GLYPHS={
 'Q':['M91 45 C127 45 146 74 146 117 L146 142 C146 183 126 209 91 209 C55 209 35 182 35 142 L35 116 C35 73 55 45 91 45 Z',
      'M99 177 C110 185 123 202 147 222'],
 'u':['M180 104 L180 158 C180 195 199 208 225 208 C251 208 267 191 267 156 L267 104'],
 'i1':['M310 104 L310 205'],
 'm':['M353 205 L353 104 M353 146 C353 121 370 101 391 101 C415 101 424 117 424 142 L424 205 M424 147 C424 121 439 101 460 101 C486 101 493 119 493 146 L493 205'],
 'i2':['M533 104 L533 205']
}
import re
TKN=re.compile(r'[MLCZ]|[-+]?(?:\d+(?:\.\d*)?|\.\d+)')
def segments(text):
 toks=TKN.findall(text);i=0;outp=[];path=[];start=None
 def num():
  nonlocal i
  v=float(toks[i]);i+=1;return v
 while i<len(toks):
  op=toks[i];i+=1
  if op=='M':
   if path:outp.append(path)
   start=(num(),num());path=[[start,start,start]]
  elif op=='L':
   pos=(num(),num());path[-1][2]=path[-1][0];path.append([pos,pos,pos])
  elif op=='C':
   p1=(num(),num());p2=(num(),num());end=(num(),num());path[-1][2]=p1;path.append([end,p2,end])
  elif op=='Z':
   if path and path[-1][0]!=start:path.append([start,start,start])
   if path:outp.append(path);path=[]
 if path:outp.append(path)
 return outp

def glyph(name,draw,offset,begin,finish,mat,rad=.027,z=.30):
 for k,ds in enumerate(draw):
  for m,seg in enumerate(segments(ds)):
   cv=bpy.data.curves.new('Quími A | '+name+' | geometria','CURVE')
   cv.dimensions='3D';cv.bevel_depth=rad;cv.bevel_resolution=5;cv.resolution_u=24
   sp=cv.splines.new('BEZIER');sp.bezier_points.add(len(seg)-1)
   for ctrl,bp in zip(seg,sp.bezier_points):
    def to(p):return Wp((p[0]+offset,p[1]),z)
    bp.co=to(ctrl[0]);bp.handle_left=to(ctrl[1]);bp.handle_right=to(ctrl[2]);bp.handle_left_type='FREE';bp.handle_right_type='FREE'
   cv.materials.append(mat)
   ob=bpy.data.objects.new('Quími A | '+name+' | '+str(k)+'-'+str(m),cv)
   bpy.context.collection.objects.link(ob)
   for fr,v in [(1,.001),(begin,.001),(finish,1),(210,1)]:
    cv.bevel_factor_end=v;cv.keyframe_insert(data_path='bevel_factor_end',frame=fr)
   ease_interp(cv)

GLYPH_TIMES=[('Q',0,136,153),('u',-3,143,162),('i1',-5,150,168),('m',-7,153,186),('i2',-9,169,190)]
for name,dx,begin,finish in GLYPH_TIMES:
 glyph(name,GLYPHS[name],dx,begin,finish,SILVER,z=.32)
 # camada escura traseira gera espessura física, não sombra em CSS
 glyph(name+' | camada profunda',GLYPHS[name],dx,begin,finish,DARK,rad=.038,z=.21)

# Acento vetorial molecular V7, não ponto simples do i.
for idx,(pt,material) in enumerate([((294,77),CYAN),((318,49),MAGENTA)]):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,radius=.036,location=Wp(pt,.40))
 ob=bpy.context.object;ob.name='Quími A | acento nó '+str(idx);ob.data.materials.append(material)
 for fr,v in [(1,.001),(177+idx*6,.001),(185+idx*5,1),(210,1)]:
  ob.scale=(v,v,v);ob.keyframe_insert(data_path='scale',frame=fr)
tube('Quími A | acento ligação',[(294,77),(318,49)],SILVER,.019,179,190,z=.38,coords=Wp)
# ponto do último i é parte da tipografia original A
bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=.045,location=Wp((524,65),.39))
ob=bpy.context.object;ob.name='Quími A | ponto final i';ob.data.materials.append(SILVER)
for fr,v in [(1,.001),(176,.001),(191,1),(210,1)]:
 ob.scale=(v,v,v);ob.keyframe_insert(data_path='scale',frame=fr)

# Grade discreta e estúdio com luz lateral, útil para medir profundidade.
for k in range(-7,8):tube('Estúdio | grade vertical '+str(k),[(450+k*75,-150),(450+k*75,800)],GRID,.0018,1,1,z=-.38)
for k in range(-5,6):tube('Estúdio | grade horizontal '+str(k),[(-300,325+k*75),(1200,325+k*75)],GRID,.0018,1,1,z=-.38)

def area_light(name,xyz,color,power,size):
 dat=bpy.data.lights.new(name,'AREA');dat.energy=power;dat.size=size;dat.color=rgb(color)
 obj=bpy.data.objects.new(name,dat);bpy.context.collection.objects.link(obj);obj.location=xyz
 obj.rotation_euler=(-obj.location).to_track_quat('-Z','Y').to_euler();return obj
area_light('Luz key fria',(-4,2,7),'#C5E9FF',730,7)
area_light('Luz rim ciano',(-1.0,-2,5),'#00E5FF',410,4)
area_light('Luz rim magenta',(4,0,5),'#FF2A8D',330,4)
area_light('Luz neutra letras',(-5.2,-2.3,6),'#F2F7FF',390,5)

camera=bpy.data.objects.new('Camera',bpy.data.cameras.new('Câmera heroica → frontal'))
bpy.context.collection.objects.link(camera);sc.camera=camera
camera.data.type='ORTHO';camera.data.ortho_scale=12.5
for f,location,target,zoom in [
 (1,(-.8,-1.0,14),(-.5,0,0),12.6),
 (86,(-.3,-.75,12),(-.3,0,0),10.9),
 (129,(-.8,-.5,12),(-.65,0,0),11.5),
 (180,(-.8,-.2,13),(-.75,0,0),12.0),
 (210,(-.8,0,14),(-.8,0,0),12.5)]:
 camera.location=location
 camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
 camera.keyframe_insert(data_path='location',frame=f)
 camera.keyframe_insert(data_path='rotation_euler',frame=f)
 camera.data.ortho_scale=zoom;camera.data.keyframe_insert(data_path='ortho_scale',frame=f)

sc.frame_set(210)
blend=out/'QuimiX_REACAO_R8.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
print('QUIMIX_BLEND_SAVED',blend,flush=True)
if not a.quick:
 for frame,name in [(20,'01_reagentes'),(64,'02_convergencia'),(110,'03_nucleo_e_X'),(160,'04_quimi_produtos'),(210,'05_assinatura_final')]:
  sc.frame_set(frame);sc.render.filepath=str(out/(name+'.png'))
  print('QUIMIX_RENDER_START',name,frame,flush=True)
  bpy.ops.render.render(write_still=True)
  print('QUIMIX_RENDER_OK',name,flush=True)
print('QUIMIX_R8_DONE',flush=True)

# R8: cinco marcos renderizados em Cycles, validação por artefato.

# Script de modelagem e cinemática em 210 quadros.