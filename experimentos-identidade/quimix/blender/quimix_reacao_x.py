"""QuímiX: X original em 3D. Fluxo ciano (entrada) -> centro -> magenta (produtos).
Usar Blender: blender -b --factory-startup --python quimix_reacao_x.py -- --output render --still
Extraído de laboratoriovirtual/index.html, SVG .brand-mark-icon (900×650).
Não é simulação de uma reação química específica.
"""
import bpy, sys, argparse
from pathlib import Path
from mathutils import Vector
parser=argparse.ArgumentParser()
parser.add_argument('--output',default='render')
parser.add_argument('--still',action='store_true')
parser.add_argument('--animation',action='store_true')
a=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
out=Path(a.output).resolve();out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
sc=bpy.context.scene;sc.frame_start=1;sc.frame_end=120;sc.render.fps=24
sc.render.resolution_x=1280;sc.render.resolution_y=720;sc.render.resolution_percentage=100
sc.render.image_settings.file_format='PNG';sc.render.engine='CYCLES';sc.cycles.samples=12
sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('Fundo escuro');w.use_nodes=True
w.node_tree.nodes['Background'].inputs['Color'].default_value=(.005,.009,.019,1);sc.world=w

def hex4(s):
    s=s.strip('#');return tuple(int(s[i:i+2],16)/255 for i in (0,2,4))+(1,)
def emission(name,col,strength):
    m=bpy.data.materials.new(name);m.use_nodes=True
    n=m.node_tree.nodes;n.clear()
    e=n.new('ShaderNodeEmission');e.inputs['Color'].default_value=hex4(col)
    e.inputs['Strength'].default_value=strength
    o=n.new('ShaderNodeOutputMaterial');m.node_tree.links.new(e.outputs[0],o.inputs['Surface'])
    return m
cyan=emission('Reagentes | ciano','#00E5FF',5)
pink=emission('Produtos | magenta','#FF2A8D',5)
violet=emission('Conector violeta','#8B5CF6',3)
white=emission('Reação no centro','#E7FAFF',8)
dark=emission('Grade delicada','#324352',.25)
metal=bpy.data.materials.new('Grafite estrutural');metal.use_nodes=True
p=metal.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=hex4('#2C3642')
p.inputs['Metallic'].default_value=.7;p.inputs['Roughness'].default_value=.3
steel=bpy.data.materials.new('Conexões em grafite');steel.use_nodes=True
p=steel.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=hex4('#708090')
p.inputs['Metallic'].default_value=.43;p.inputs['Roughness'].default_value=.35

def P(point,z=.24):
    return ((point[0]-450)*.008,(325-point[1])*.008,z)
def ks(o,keys):
    for f,v in keys:
        o.scale=(v,v,v);o.keyframe_insert(data_path='scale',frame=f)
def loc(o,keys,z=.35):
    for f,point in keys:
        o.location=P(point,z);o.keyframe_insert(data_path='location',frame=f)
def curve(name,pts,mat=steel,rad=.011,reveal=(1,1),z=.27,cyclic=False):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=rad;c.bevel_resolution=3
    spline=c.splines.new('POLY');spline.points.add(len(pts)-1)
    for cp,pt in zip(spline.points,pts): cp.co=(*P(pt,z),1)
    spline.use_cyclic_u=cyclic
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);c.materials.append(mat)
    if reveal[0]!=reveal[1]:
        c.bevel_factor_end=0;c.keyframe_insert(data_path='bevel_factor_end',frame=reveal[0])
        c.bevel_factor_end=1;c.keyframe_insert(data_path='bevel_factor_end',frame=reveal[1])
    return o
def sphere(name,at,mat,rad=.07,keys=((1,1),),z=.38,travel=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,radius=rad,location=P(at,z))
    ob=bpy.context.object;ob.name=name;ob.data.materials.append(mat);ks(ob,keys)
    if travel: loc(ob,travel,z)
    return ob
def ring(name,at,rad,frame=1):
    bpy.ops.mesh.primitive_torus_add(major_radius=rad,minor_radius=.008,major_segments=48,minor_segments=8,location=P(at,.30))
    ob=bpy.context.object;ob.name=name;ob.data.materials.append(steel)
    if frame>1:ks(ob,[(1,.001),(frame-8,.001),(frame,1),(120,1)])
    return ob

# Fonte SVG da silhueta com EXATOS 12 vértices, não duas barras genéricas.
X=[(265,100),(370,100),(450,270),(530,100),(635,100),(495,325),
   (635,550),(530,550),(450,380),(370,550),(265,550),(405,325)]
sh=bpy.data.curves.new('Forma SVG original do X','CURVE');sh.dimensions='2D'
sh.fill_mode='BOTH';sh.extrude=.080;sh.bevel_depth=.012;sh.bevel_resolution=3
sp=sh.splines.new('POLY');sp.points.add(len(X)-1)
for co,pt in zip(sp.points,X):co.co=(*P(pt,0),1)
sp.use_cyclic_u=True
body=bpy.data.objects.new('X | corpo 3D em grafite',sh);bpy.context.collection.objects.link(body)
sh.materials.append(metal)
ks(body,[(1,.001),(52,.001),(60,.22),(71,.81),(80,1.02),(90,1),(120,1)])
curve('Friso perimetral do X',X,steel,.007,(65,86),.23,True)

# Infraestrutura à esquerda do X: anéis e ramificações são do programa original.
left=[
 ('Ramo esquerdo alto externo',[(110,210),(200,210)],(17,34)),
 ('Ramo esquerdo baixo externo',[(110,440),(200,440)],(18,38)),
 ('Ramo alto convergente',[(200,210),(245,310),(260,325)],(29,52)),
 ('Ramo baixo convergente',[(200,440),(245,340),(260,325)],(30,54)),
 ('Eixo ao centro',[(260,325),(433,325)],(44,61))]
for name,coords,fr in left:curve(name,coords,steel,.012,fr)
for i,(pt,r) in enumerate([((200,210),.112),((110,210),.112),((200,440),.112),((110,440),.09)]):
    ring('Anel terminal esquerdo %d'%i,pt,r,38+i*2)
ring('Anel concent. externo do SVG',(260,325),.176,55)
ring('Anel concent. interno do SVG',(260,325),.104,55)
sphere('Núcleo violeta original',(260,325),violet,.052,[(1,.001),(48,.001),(58,1),(120,1)])
# Quatro esferas de ENTRADA CIANO movendo-se a partir dos ramais de esquerda.
paths=[
 [(8,(110,210)),(26,(110,210)),(35,(200,210)),(45,(245,310)),(51,(260,325)),(61,(433,325)),(66,(450,325))],
 [(11,(200,210)),(29,(200,210)),(42,(245,310)),(53,(260,325)),(63,(433,325)),(67,(450,325))],
 [(12,(110,440)),(27,(110,440)),(39,(200,440)),(50,(245,340)),(56,(260,325)),(64,(433,325)),(68,(450,325))],
 [(15,(200,440)),(30,(200,440)),(45,(245,340)),(56,(260,325)),(64,(433,325)),(69,(450,325))]]
for i,path in enumerate(paths):
    end=path[-1][0]
    sphere('REAGENTE CIANO %02d'%i,path[0][1],cyan,.080,
           [(1,.001),(path[0][0],1),(end-2,.85),(end+2,.001),(120,.001)],travel=path)
# Nós estáticos finais preservam o estilo original, inclusive magenta do ramo baixo esquerdo.
for i,(pt,m) in enumerate([((110,210),cyan),((200,210),cyan),((200,440),pink)]):
    sphere('Nó lateral original %02d'%i,pt,m,.045,[(1,.001),(98,.001),(105,1),(120,1)])

# Quatro ligações e seis esferas do centro: três de cada cor.
for i,(u,v) in enumerate([((380,180),(433,325)),((380,470),(433,325)),
                         ((467,325),(520,180)),((467,325),(520,470))]):
    curve('Ligação interna original %02d'%i,[u,v],steel,.012,(60+i*7,76+i*6),.30)
for i,(pt,m,fr) in enumerate([((380,180),cyan,71),((380,470),cyan,75),((433,325),cyan,79),
                               ((467,325),pink,81),((520,180),pink,93),((520,470),pink,96)]):
    sphere('Nó interno original %02d'%i,pt,m,.055,[(1,.001),(fr-8,.001),(fr,1),(120,1)])

# Reação no centro só APÓS a chegada ciana.
sphere('FLASH | reação no X',(450,325),white,.21,
       [(1,.001),(54,.001),(62,1.25),(70,.35),(77,.001),(120,.001)],z=.47)
# Duas bordas cromáticas do original, ativadas em momentos diferentes.
for i in range(len(X)):
    u,v=X[i],X[(i+1)%len(X)]
    pieces=[(u,v)]
    if (u[0]-450)*(v[0]-450)<0:
        m=(450,u[1]+(450-u[0])/(v[0]-u[0])*(v[1]-u[1]))
        pieces=[(u,m),(m,v)]
    for j,(aa,bb) in enumerate(pieces):
        c=cyan if (aa[0]+bb[0])<900 else pink
        f=(63,86) if c==cyan else (75,101)
        curve('Reflexo %02d-%d'%(i,j),[aa,bb],c,.009,f,.24)

# Lado dos PRODUTOS, conforme geometria original: ramo central + duas barras paralelas.
right=[
 ('Eixo de saída',[(467,325),(575,325)],(72,85)),
 ('Saída ramificada alta',[(575,325),(535,260)],(77,91)),
 ('Saída ramificada baixa',[(575,325),(535,390)],(78,92)),
 ('Ligação dupla 1',[(585,319),(640,319)],(79,95)),
 ('Ligação dupla 2',[(585,331),(640,331)],(80,96)),
 ('Terminal direito superior',[(640,325),(720,210)],(86,103)),
 ('Terminal direito inferior',[(640,325),(720,440)],(88,103))]
for n,pts,fr in right:curve('PRODUTO | '+n,pts,steel,.011,fr)
# Partículas magenta só aparecem APÓS o evento no centro (f>=71).
products=[
 ('saída central',[(71,(450,325)),(81,(467,325))]),
 ('braço alto',[(73,(450,325)),(82,(467,325)),(96,(520,180))]),
 ('braço baixo',[(74,(450,325)),(83,(467,325)),(98,(520,470))]),
 ('terminal externo',[(76,(450,325)),(83,(467,325)),(91,(575,325)),(95,(640,325)),(108,(720,210))])]
for i,(n,route) in enumerate(products):
    arrival=route[-1][0]
    sphere('PRODUTO MAGENTA | '+n,route[0][1],pink,.063,
           [(1,.001),(route[0][0]-1,.001),(route[0][0]+3,1.2),(arrival,.85),(120,.85)],
           travel=route,z=.40)
ring('Anel neutro de saída alto',(720,210),.112,106)
ring('Anel neutro de saída baixo',(720,440),.088,108)
sphere('Nó terminal neutro original',(575,325),steel,.032,[(1,.001),(96,.001),(106,1),(120,1)])

for i in range(-8,9):
    curve('Grid Y %d'%i,[(450+75*i,-70),(450+75*i,720)],dark,.0015,z=-.25)
for i in range(-5,6):
    curve('Grid X %d'%i,[(-100,325+75*i),(1000,325+75*i)],dark,.0015,z=-.25)
def light(name,at,col,power):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=hex4(col)[:3];d.size=5
    ob=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(ob)
    ob.location=at;ob.rotation_euler=(-ob.location).to_track_quat('-Z','Y').to_euler()
light('Luz ciano',(-3,1,6),'#00E5FF',270)
light('Luz magenta',(3,-1,6),'#FF2A8D',270)
light('Luz neutra',(0,1,8),'#E5F4FF',340)
camd=bpy.data.cameras.new('Câmera ortográfica');cam=bpy.data.objects.new('Camera',camd)
bpy.context.collection.objects.link(cam);sc.camera=cam;camd.type='ORTHO';camd.ortho_scale=9.4
cam.location=(0,0,13);cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler()

# Marcadores de fases facilitam refino direto no Blender.
for f,title in [(1,'01 reagentes'),(24,'02 convergência'),(54,'03 reação'),(71,'04 produtos'),(104,'05 repouso')]:
    sc.timeline_markers.new(title,frame=f)
sc.frame_set(111)
blend=out/'quimix_x_reagentes_produtos.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
if a.still:
    for f in [20,49,64,87,111]:
        sc.frame_set(f);sc.render.filepath=str(out/('quimix_blender_f%03d.png'%f))
        bpy.ops.render.render(write_still=True)
if a.animation:
    (out/'frames').mkdir(exist_ok=True)
    sc.render.filepath=str(out/'frames'/'frame_')
    bpy.ops.render.render(animation=True)
print('BLENDER 3D COMPLETO:',blend)
