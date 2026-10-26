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

# --- V7 | fonte A em curvas tridimensionais, sem fontes externas ---
import xml.etree.ElementTree as ET, re
SRC_V7_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"qm-v7-svg\" viewBox=\"22 27 545 213\" role=\"img\" aria-label=\"Quími, tipografia autoral A refinada\">\n<defs><linearGradient id=\"qmx-v7-accent\" x1=\"0\" y1=\"1\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#00e5ff\"/><stop offset=\".5\" stop-color=\"#c7eff9\"/><stop offset=\"1\" stop-color=\"#ff2a8d\"/></linearGradient></defs>\n<g class=\"v7-depth-back\" fill=\"none\" stroke=\"#14212d\" stroke-width=\"12\" stroke-linecap=\"round\" stroke-linejoin=\"round\" transform=\"translate(-10 10)\"><g class=\"v7-glyph glyph-q\" transform=\"translate(0,0)\"><path d=\"M91 45 C127 45 146 74 146 117 L146 142 C146 183 126 209 91 209 C55 209 35 182 35 142 L35 116 C35 73 55 45 91 45 Z\" pathLength=\"1\"/><path d=\"M99 177 C110 185 123 202 147 222\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-u\" transform=\"translate(-3,0)\"><path d=\"M180 104 L180 158 C180 195 199 208 225 208 C251 208 267 191 267 156 L267 104\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-i1\" transform=\"translate(-5,0)\"><path d=\"M310 104 L310 205\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-m\" transform=\"translate(-7,0)\"><path d=\"M353 205 L353 104 M353 146 C353 121 370 101 391 101 C415 101 424 117 424 142 L424 205 M424 147 C424 121 439 101 460 101 C486 101 493 119 493 146 L493 205\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-i2\" transform=\"translate(-9,0)\"><path d=\"M533 104 L533 205\" pathLength=\"1\"/></g></g>\n<g class=\"v7-depth-front\" fill=\"none\" stroke=\"#304456\" stroke-width=\"11\" stroke-linecap=\"round\" stroke-linejoin=\"round\" transform=\"translate(-5 5)\"><g class=\"v7-glyph glyph-q\" transform=\"translate(0,0)\"><path d=\"M91 45 C127 45 146 74 146 117 L146 142 C146 183 126 209 91 209 C55 209 35 182 35 142 L35 116 C35 73 55 45 91 45 Z\" pathLength=\"1\"/><path d=\"M99 177 C110 185 123 202 147 222\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-u\" transform=\"translate(-3,0)\"><path d=\"M180 104 L180 158 C180 195 199 208 225 208 C251 208 267 191 267 156 L267 104\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-i1\" transform=\"translate(-5,0)\"><path d=\"M310 104 L310 205\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-m\" transform=\"translate(-7,0)\"><path d=\"M353 205 L353 104 M353 146 C353 121 370 101 391 101 C415 101 424 117 424 142 L424 205 M424 147 C424 121 439 101 460 101 C486 101 493 119 493 146 L493 205\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-i2\" transform=\"translate(-9,0)\"><path d=\"M533 104 L533 205\" pathLength=\"1\"/></g></g>\n<g class=\"v7-word-face\" fill=\"none\" stroke=\"#e1ecf5\" stroke-width=\"8.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><g class=\"v7-glyph glyph-q\" transform=\"translate(0,0)\"><path d=\"M91 45 C127 45 146 74 146 117 L146 142 C146 183 126 209 91 209 C55 209 35 182 35 142 L35 116 C35 73 55 45 91 45 Z\" pathLength=\"1\"/><path d=\"M99 177 C110 185 123 202 147 222\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-u\" transform=\"translate(-3,0)\"><path d=\"M180 104 L180 158 C180 195 199 208 225 208 C251 208 267 191 267 156 L267 104\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-i1\" transform=\"translate(-5,0)\"><path d=\"M310 104 L310 205\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-m\" transform=\"translate(-7,0)\"><path d=\"M353 205 L353 104 M353 146 C353 121 370 101 391 101 C415 101 424 117 424 142 L424 205 M424 147 C424 121 439 101 460 101 C486 101 493 119 493 146 L493 205\" pathLength=\"1\"/></g><g class=\"v7-glyph glyph-i2\" transform=\"translate(-9,0)\"><path d=\"M533 104 L533 205\" pathLength=\"1\"/></g></g>\n<circle class=\"v7-dot\" cx=\"524\" cy=\"65\" r=\"4.6\" fill=\"#e1ecf5\"/>\n<g class=\"v7-accent\" stroke-linecap=\"round\"><path d=\"M294 77 L318 49\" stroke=\"url(#qmx-v7-accent)\" stroke-width=\"4.3\" pathLength=\"1\"/><circle cx=\"294\" cy=\"77\" r=\"2.5\" fill=\"#00e5ff\"/><circle cx=\"318\" cy=\"49\" r=\"3.0\" fill=\"#ff2a8d\"/></g>\n</svg>"
v7_ns='{http://www.w3.org/2000/svg'
v7_root=ET.fromstring(SRC_V7_SVG)
v7_material=bpy.data.materials.new('V7 | prata neo-minimalista')
v7_material.diffuse_color=(.77,.86,.93,1)
v7_material.use_nodes=True
v7_bsdf=v7_material.node_tree.nodes.get('Principled BSDF')
if v7_bsdf:
    v7_bsdf.inputs['Base Color'].default_value=(.77,.86,.93,1)
    v7_bsdf.inputs['Metallic'].default_value=.56
    v7_bsdf.inputs['Roughness'].default_value=.25
def v7_paths(d):
    toks=re.findall(r'[MLCZ]|[-+]?(?:\d+(?:\.\d*)?|\.\d+)',d)
    k=0; portions=[]; part=[]; origin=None
    def take(n):
        nonlocal k
        a=[float(toks[k+x]) for x in range(n)]
        k+=n;return a
    while k<len(toks):
        op=toks[k];k+=1
        if op=='M':
            if part:portions.append(part)
            x,y=take(2);origin=(x,y);part=[[(x,y),(x,y),(x,y)]]
        elif op=='L':
            x,y=take(2);part[-1][2]=part[-1][0];part.append([(x,y),(x,y),(x,y)])
        elif op=='C':
            x1,y1,x2,y2,x,y=take(6)
            part[-1][2]=(x1,y1);part.append([(x,y),(x2,y2),(x,y)])
        elif op=='Z':
            if part and part[-1][0]!=origin:part.append([origin,origin,origin])
            if part:portions.append(part);part=[]
        else:raise ValueError('Unsupported glyph path op '+op)
    if part:portions.append(part)
    return portions
def v7_pos(x,y,z=.28):
    return (-6.0+(x-22)*.0079,(125-y)*.0079,z)
v7_seq={'q':(81,94),'u':(86,99),'i1':(90,103),'m':(96,109),'i2':(102,115)}
for gr in v7_root.iter(v7_ns+'g'):
    clas=gr.attrib.get('class','')
    if 'v7-word-face' not in clas:continue
    for letter in gr.findall(v7_ns+'g'):
        kind=letter.attrib.get('class','').split('glyph-')[-1]
        dx=float(re.search(r'translate\(([-.\d]+)',letter.attrib.get('transform','translate(0,0)')).group(1))
        for num,path in enumerate(letter.findall(v7_ns+'path')):
            cu=bpy.data.curves.new('V7 Quími | '+kind+' | traço '+str(num+1),'CURVE')
            cu.dimensions='3D';cu.bevel_depth=.034;cu.bevel_resolution=5
            cu.resolution_u=24
            for segment in v7_paths(path.attrib['d']):
                sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(segment)-1)
                for item,p in zip(segment,sp.bezier_points):
                    p.co=v7_pos(item[0][0]+dx,item[0][1])
                    p.handle_left=v7_pos(item[1][0]+dx,item[1][1])
                    p.handle_right=v7_pos(item[2][0]+dx,item[2][1])
                    p.handle_left_type='FREE';p.handle_right_type='FREE'
            cu.materials.append(v7_material)
            ob=bpy.data.objects.new('V7 | '+kind+' | '+str(num+1),cu)
            bpy.context.collection.objects.link(ob)
            begin,finish=v7_seq[kind]
            for fr,value in [(1,0),(begin,0),(finish,1),(120,1)]:
                cu.bevel_factor_end=value;cu.keyframe_insert(data_path='bevel_factor_end',frame=fr)
# Acento desenhado em geometria real (duas bolinhas + ligação).
def v7_sphere(name, x,y,material,radius,frame):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,radius=radius,location=v7_pos(x,y,.36))
    obj=bpy.context.object;obj.name=name;obj.data.materials.append(material)
    for fr,v in [(1,.001),(frame,.001),(frame+4,1),(120,1)]:
        obj.scale=(v,v,v);obj.keyframe_insert(data_path='scale',frame=fr)
    return obj
v7_sphere('V7 | nó acento ciano',294,77,v7_material,.027,106)
v7_sphere('V7 | nó acento magenta',318,49,v7_material,.034,111)
v7_sphere('V7 | ponto do último i',524,65,v7_material,.038,112)
# Revelar também a haste diagonal do acento como curva Blender.
v7_a=bpy.data.curves.new('V7 | haste acento','CURVE');v7_a.dimensions='3D';v7_a.bevel_depth=.023
sp=v7_a.splines.new('POLY');sp.points.add(1)
for dst,(x,y) in zip(sp.points,[(294,77),(318,49)]):
    pos=v7_pos(x,y,.36);dst.co=(*pos,1)
v7_a.materials.append(v7_material)
ob=bpy.data.objects.new('V7 | acento químico',v7_a);bpy.context.collection.objects.link(ob)
for fr,val in [(1,0),(102,0),(115,1),(120,1)]:
    v7_a.bevel_factor_end=val;v7_a.keyframe_insert(data_path='bevel_factor_end',frame=fr)
# Abrir a câmera para a palavra; o X original mantém sua forma e conexões.
for fr,p,look,scale in [(85,(0,0,13),(0,0,0),9.4),(105,(-1.25,-.3,13),(-1.45,0,0),10.3),(120,(-1.9,0,13),(-1.95,0,0),10.8)]:
    cam.location=p
    cam.rotation_euler=(Vector(look)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.keyframe_insert(data_path='location',frame=fr)
    cam.keyframe_insert(data_path='rotation_euler',frame=fr)
    camd.ortho_scale=scale;camd.keyframe_insert(data_path='ortho_scale',frame=fr)
sc.timeline_markers.new('V7 Quími | Q em formação',frame=81)
sc.timeline_markers.new('V7 QuímiX | acabamento',frame=116)
# --- fim V7 ---

sc.frame_set(111)
blend=out/'quimix_tipografia_a_v7.blend'
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
