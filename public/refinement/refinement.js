import { BufferGeometry, BufferAttribute, Texture } from '/assets/game-B7kPresence.js?v=20261106marble1';
import { geometryKey, refinementKind } from './geometry-key.js';
import { surfaceProfile, makeSurfaceTextures } from './materials.js';

const scenes = new Set();
let notifyScenes = () => {};
export function registerRefinementScene(scene) {
  scenes.add(scene);notifyScenes();
  return () => scenes.delete(scene);
}

export function mountRefinement({scene,renderer,signal,refresh}) {
  const control=document.createElement('label');control.className='refinement-control';
  const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id='temple-refinement';
  control.append(checkbox,document.createTextNode(' 精修模型与材质'));
  const status=document.createElement('p');status.id='temple-refinement-status';status.setAttribute('role','status');
  const container=document.querySelector('.environment-settings');container?.append(control,status);
  let enabled=false,ready=false,disposed=false,manifest,buffer;
  const request=new AbortController();
  const originals=new Map(),materialOriginals=new Map(),replacements=new Map(),sourceGeometries=new Map(),seen=new WeakSet();
  const surfaces=makeSurfaceTextures(Texture);
  const removeScene=registerRefinementScene(scene);
  function getGeometry(original){
    const key=geometryKey(original),entry=manifest.meshes[key];if(!entry)return null;
    if(replacements.has(key))return replacements.get(key);
    const g=new BufferGeometry();
    for(const [name,a] of Object.entries(entry.attributes))g.setAttribute(name,new BufferAttribute(new Float32Array(buffer,a.offset,a.length),a.itemSize));
    g.setIndex(new BufferAttribute(new Uint32Array(buffer,entry.index.offset,entry.index.length),1));
    // Every baked mesh uses one material; retain original group material index.
    if(original.groups.length)g.addGroup(0,entry.index.length,original.groups[0].materialIndex);
    g.computeBoundingBox();g.computeBoundingSphere();g.userData.refinedSource=key;
    sourceGeometries.set(key,original);replacements.set(key,g);return g;
  }
  function refineMaterial(m,trail){
    if(!m?.isMeshStandardMaterial || materialOriginals.has(m))return;
    const profile=surfaceProfile(m,trail);if(!profile)return;
    const inherited=m.userData.templeRefinementBase;
    const original=inherited ? {roughness:inherited.roughness,metalness:inherited.metalness,bumpScale:inherited.bumpScale,bumpMap:inherited.addedBump?null:m.bumpMap} : {roughness:m.roughness,metalness:m.metalness,bumpMap:m.bumpMap,bumpScale:m.bumpScale};
    m.userData.templeRefinementBase={roughness:original.roughness,metalness:original.metalness,bumpScale:original.bumpScale,addedBump:!original.bumpMap};
    materialOriginals.set(m,original);
    m.roughness=profile.roughness;m.metalness=profile.metalness;
    if(profile.bump && !m.bumpMap){m.bumpMap=surfaces.get(profile.kind);m.bumpScale=profile.bump;}
    m.needsUpdate=true;
  }
  function scan(){
    if(!ready||!enabled||disposed)return;
    let changed=false;
    for(const root of scenes)root.traverse(o=>{
      if(!o.isMesh||seen.has(o))return;seen.add(o);changed=true;
      const trail=[];for(let a=o;a;a=a.parent)trail.push(a.name);
      for(const m of [o.material].flat())refineMaterial(m,trail.join('/'));
      const inherited=sourceGeometries.get(o.geometry.userData.refinedSource);
      if(inherited){originals.set(o,inherited);return;}
      const g=o.geometry;
      // Preserve all skinning/morph buffers and custom instancing shaders.
      if(o.isSkinnedMesh || g.attributes.uv1 || g.attributes.uv2 || g.attributes.skinIndex || Object.keys(g.morphAttributes).length || Object.keys(g.attributes).some(k=>!['position','normal','uv','uv1','uv2','color','tangent'].includes(k)))return;
      if(refinementKind(o)==='surface')return;
      const replacement=getGeometry(g);
      if(replacement){originals.set(o,g);o.geometry=replacement;}
    });
    renderer.domElement.dataset.refinement='refined';
    renderer.domElement.dataset.refinedMeshes=String(originals.size);
    renderer.domElement.dataset.refinedMaterials=String(materialOriginals.size);
    const message=`已启用精修：${originals.size} 个网格、${materialOriginals.size} 种材质。`;
    if(status.textContent!==message)status.textContent=message;
    if(changed)refresh();
  }
  function restore(){
    for(const root of scenes)root.traverse(o=>{
      if(!o.isMesh)return;
      const base=sourceGeometries.get(o.geometry.userData.refinedSource);
      if(base)o.geometry=base;
      for(const m of [o.material].flat()){
        const v=m.userData.templeRefinementBase;
        if(v&&!materialOriginals.has(m))materialOriginals.set(m,{roughness:v.roughness,metalness:v.metalness,bumpScale:v.bumpScale,bumpMap:v.addedBump?null:m.bumpMap});
      }
    });
    for(const [o,g] of originals)o.geometry=g;originals.clear();
    for(const [m,values] of materialOriginals){Object.assign(m,values);delete m.userData.templeRefinementBase;m.needsUpdate=true;}materialOriginals.clear();
    renderer.domElement.dataset.refinement='original';status.textContent='当前显示原版模型与材质。';refresh();
  }
  const processScan=scan;
  // scan itself uses seen, so clear its entries when restoring using all live roots.
  function resetSeen(){for(const root of scenes)root.traverse(o=>seen.delete(o));}
  function toggle(value){enabled=value;checkbox.checked=value;if(value){resetSeen();processScan();}else restore();}
  checkbox.disabled=true;status.textContent='正在准备精修模型…';
  checkbox.addEventListener('change',()=>{toggle(checkbox.checked);try{localStorage.setItem('temple-refinement',enabled?'on':'off');}catch{}},{signal});
  let timer;
  (async()=>{
    try{
      const responses=await Promise.all([fetch('/refinement/manifest.json',{signal:request.signal}),fetch('/refinement/geometry.bin',{signal:request.signal})]);
      if(responses.some(r=>!r.ok))throw new Error('精修资源请求失败');
      [manifest,buffer]=await Promise.all([responses[0].json(),responses[1].arrayBuffer()]);
      if(disposed)return;
      if(manifest.version!==1 || manifest.stats.bufferBytes!==buffer.byteLength)throw new Error('精修资源版本不匹配');
      ready=true;checkbox.disabled=false;
      let preference;try{preference=localStorage.getItem('temple-refinement');}catch{}
      const query=new URLSearchParams(location.search).get('refinement');
      toggle(query ? !['off','original'].includes(query) : preference!=='off');
      notifyScenes=()=>queueMicrotask(scan);timer=setInterval(scan,1800);
    }catch(error){if(disposed)return;enabled=false;restore();checkbox.checked=false;status.textContent='精修资源加载失败，已保留原版。';console.warn('模型精修加载失败',error);}
  })();
  signal.addEventListener('abort',()=>{disposed=true;request.abort();clearInterval(timer);notifyScenes=()=>{};restore();removeScene();for(const g of replacements.values())g.dispose();surfaces.dispose();control.remove();status.remove();},{once:true});
  return {scan,restore,toggle};
}
