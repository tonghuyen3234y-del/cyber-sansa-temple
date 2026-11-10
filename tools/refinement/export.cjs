const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs');const path=require('path');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true,args:['--use-gl=angle','--use-angle=metal']});try{
const p=await b.newPage();await p.route('**/assets/game-B7kPresence.js*',async r=>{let x=await r.fetch();await r.fulfill({response:x,body:(await x.text()).replace('const world={','window.testTemple=this;const world={')})});
await p.goto('http://127.0.0.1:4214/?environment=original&refinement=off');await p.waitForFunction(()=>window.testTemple?.isReady,null,{timeout:60000});await p.waitForSelector('.wish-locator');
const download=p.waitForEvent('download',{timeout:120000});
const data=await p.evaluate(async()=>{
const {geometryKey,refinementKind}=await import('/refinement/geometry-key.js');const w=window.testTemple;await w.sanctuary.completeGarden();w.scene.updateMatrixWorld(true);
const geometries={},objects=[];let meshCount=0;const materials={};
w.scene.traverse(o=>{if(!o.isMesh||!o.geometry.attributes.position)return;meshCount++;
 const g=o.geometry,key=geometryKey(g),kind=refinementKind(o);const mats=[o.material].flat();
 const trail=[];for(let a=o;a&&a!==w.scene;a=a.parent)trail.unshift(a.name||a.type);
 objects.push({name:o.name||o.parent?.name||'mesh',key,kind,skin:!!o.isSkinnedMesh,matrix:o.matrixWorld.toArray(),trail:trail.join('/'),material:mats[0]?.uuid,instances:o.isInstancedMesh?o.count:1});
 for(const m of mats) materials[m.uuid]={name:m.name,color:m.color?.toArray(),roughness:m.roughness,metalness:m.metalness,type:m.type};
 if(geometries[key]){if(kind!=='surface')geometries[key].kind=kind;return;}
 if(kind==='surface'){geometries[key]={key,kind,name:o.name,type:g.type};return;}
 const attrs={};for(const name of ['position','normal','uv','color']){const a=g.attributes[name];if(!a)continue;const values=[];for(let i=0;i<a.count;i++)for(let k=0;k<a.itemSize;k++)values.push(a.getComponent(i,k));attrs[name]={itemSize:a.itemSize,values};}
 geometries[key]={key,kind,name:o.name||mats[0]?.name||o.parent?.name||g.type,type:g.type,attrs,index:g.index?Array.from(g.index.array):null,groups:g.groups};
});const output={meshCount,geometries,objects,materials};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(output)],{type:'application/json'}));a.download='scene.json';a.click();return {meshCount,unique:Object.keys(geometries).length,bevel:Object.values(geometries).filter(g=>g.kind==='bevel').length};
});fs.mkdirSync('tools/refinement/source',{recursive:true});await (await download).saveAs('tools/refinement/source/scene.json');console.log(data);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
