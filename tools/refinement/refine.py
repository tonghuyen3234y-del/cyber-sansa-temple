"""Build local-space Blender geometry deltas; keep Three.js nodes, rigs and events intact."""
import bpy, json, math, array, sys, os
from pathlib import Path
from mathutils import Matrix
root=Path(__file__).resolve().parents[2]
data=json.loads((root/'tools/refinement/source/scene.json').read_text())
out=root/'public/refinement';out.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
manifest={'version':1,'meshes':{},'stats':{'sceneMeshes':data['meshCount'],'uniqueGeometries':len(data['geometries'])},'skipped':[]}
blob=bytearray();sources={};refined={};originalFaces=0;refinedFaces=0

def mesh_from(src):
 attrs=src['attrs'];p=attrs['position']['values'];verts=list(zip(p[0::3],p[1::3],p[2::3]));indices=src['index'] or list(range(len(verts)))
 faces=list(zip(indices[0::3],indices[1::3],indices[2::3]))
 mesh=bpy.data.meshes.new(src['key']);mesh.from_pydata(verts,[],faces);mesh.update()
 if 'uv' in attrs:
  layer=mesh.uv_layers.new(name='UVMap');v=attrs['uv']['values']
  for loop in mesh.loops:layer.data[loop.index].uv=v[loop.vertex_index*2:loop.vertex_index*2+2]
 if 'color' in attrs:
  col=mesh.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='CORNER');v=attrs['color']['values'];size=attrs['color']['itemSize']
  for loop in mesh.loops:
   c=v[loop.vertex_index*size:(loop.vertex_index+1)*size];col.data[loop.index].color=tuple(c)+(1,) if size==3 else tuple(c)
 if 'normal' in attrs:
  n=attrs['normal']['values'];normals=list(zip(n[0::3],n[1::3],n[2::3]))
  for poly in mesh.polygons:poly.use_smooth=True
  mesh.normals_split_custom_set_from_vertices(normals)
 return mesh

def append_values(values,kind):
 values=array.array(kind,values);offset=len(blob);blob.extend(values.tobytes());return {'offset':offset,'length':len(values)}

for count,(key,src) in enumerate(data['geometries'].items()):
 if src['kind']=='surface':continue
 mesh=mesh_from(src);sources[key]=mesh
 obj=bpy.data.objects.new(src['name'][:40]+'_'+key,mesh);bpy.context.collection.objects.link(obj)
 p=src['attrs']['position']['values'];ranges=[max(p[i::3])-min(p[i::3]) for i in range(3)]
 positive=[x for x in ranges if x>1e-6]
 if len(positive)<3:
  manifest['skipped'].append({'key':key,'reason':'planar'});continue
 width=min(0.018,min(positive)*0.065)
 weld=obj.modifiers.new('精修·缝合重合顶点','WELD');weld.merge_threshold=0.000001
 if src['kind']=='smooth':
  bevel=obj.modifiers.new('精修·曲面细分','SUBSURF');bevel.levels=1;bevel.render_levels=1
 else:
  bevel=obj.modifiers.new('精修·自然边缘','BEVEL');bevel.width=width;bevel.segments=3;bevel.limit_method='ANGLE';bevel.angle_limit=math.radians(35);bevel.use_clamp_overlap=True;bevel.harden_normals=True
 dg=bpy.context.evaluated_depsgraph_get();evaluated=obj.evaluated_get(dg);result=evaluated.to_mesh();result.calc_loop_triangles()
 maxtri=max(min(len(mesh.polygons)*(6.5 if src['kind']=='smooth' else 8),len(mesh.polygons)+60000),360)
 if len(result.loop_triangles)>maxtri and src['kind']=='bevel':
  evaluated.to_mesh_clear();bevel.segments=2;dg.update();evaluated=obj.evaluated_get(dg);result=evaluated.to_mesh();result.calc_loop_triangles()
 if len(result.loop_triangles)>maxtri:
  manifest['skipped'].append({'key':key,'reason':'triangle budget'});evaluated.to_mesh_clear();continue
 uv=result.uv_layers.active;col=result.color_attributes.get('Color');normals=result.corner_normals
 coords=[];ns=[];uvs=[];cols=[];indices=[];lookup={}
 for tri in result.loop_triangles:
  for li in tri.loops:
   vi=result.loops[li].vertex_index;co=tuple(result.vertices[vi].co);normal=tuple(normals[li].vector);tex=tuple(uv.data[li].uv) if uv else ();color=tuple(col.data[li].color)[:src['attrs']['color']['itemSize']] if col else ()
   token=co+normal+tex+color
   if token not in lookup:
    lookup[token]=len(coords)//3;coords.extend(co);ns.extend(normal);uvs.extend(tex);cols.extend(color)
   indices.append(lookup[token])
 if not all(math.isfinite(x) for x in coords+ns+uvs+cols):raise RuntimeError('Nonfinite '+key)
 entry={'name':src['name'],'width':width,'sourceVertices':len(mesh.vertices),'sourceTriangles':len(mesh.polygons),'triangles':len(indices)//3,'attributes':{}}
 for name,values,size in [('position',coords,3),('normal',ns,3),('uv',uvs,2),('color',cols,src['attrs'].get('color',{}).get('itemSize',3))]:
  if values:entry['attributes'][name]={**append_values(values,'f'),'itemSize':size}
 entry['index']=append_values(indices,'I');manifest['meshes'][key]=entry
 originalFaces+=len(mesh.polygons);refinedFaces+=len(indices)//3
 evaluated.to_mesh_clear()
 print('REFINED',count,key,entry['sourceTriangles'],entry['triangles'],flush=True)
manifest['stats'].update({'refinedGeometries':len(manifest['meshes']),'sourceTriangles':originalFaces,'refinedTriangles':refinedFaces,'bufferBytes':len(blob)})
(out/'geometry.bin').write_bytes(blob)
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
# Keep the editable modifier workbench separately from the textured temple composition.
work=Path(os.environ.get('REFINEMENT_WORKDIR', './refinement-work'));work.mkdir(exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(work/'全场景-网格精修工作台.blend'))
(work/'网格处理报告.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('COMPLETE',manifest['stats'],flush=True)
