// Surface-only changes keep animation shaders, vertex colours and authored maps intact.
export function surfaceProfile(material, trail = '') {
  const n = material.name.toLowerCase();
  if (/shadow|candle tips|light chamber|light on earth|butterfly/.test(n)) return null;
  if (/skin|face/.test(n) || (!n && ['d9ab7d','b88163'].includes(material.color?.getHexString()))) return { kind:'skin', roughness:0.66, metalness:0, bump:0.0006 };
  if (/cloth|cotton|linen|cushion|canvas|robe|silk/.test(n) || (!n && /知客僧/.test(trail))) return {kind:'cloth',roughness:0.92,metalness:0,bump:0.008};
  if (/bronze|brass/.test(n)) return {kind:'metal',roughness:0.46,metalness:0.72,bump:0.003};
  if (/pond/.test(n)) return {kind:'water',roughness:0.26,metalness:0.05,bump:0.035};
  if (/bark|bough/.test(n) || /古樟树干/.test(trail)) return {kind:'bark',roughness:0.95,metalness:0,bump:0.018};
  if (/leaf|leaves|fern|grass|petal|flower|shrubs|pine silhouettes/.test(n)) return {kind:'leaf',roughness:0.82,metalness:0,bump:0.003};
  if (/stone|boulder|giwa|roof|plaster|earth|ground|path/.test(n)) return {kind:'stone',roughness:0.9,metalness:0,bump:0.012};
  if (/celadon|ceramic/.test(n)) return {kind:'ceramic',roughness:0.34,metalness:0,bump:0.002};
  if (/timber|wood|walnut|bracket|bamboo|pigment/.test(n)) return {kind:'wood',roughness:0.77,metalness:0,bump:0.007};
  if (/paper|mural|plaque|credit/.test(n)) return {kind:'paper',roughness:0.88,metalness:0,bump:0};
  if (!n) {
    const c=material.color?.getHexString();
    if (['7f8077','6a6b62'].includes(c)) return {kind:'stone',roughness:0.92,metalness:0,bump:0.01};
    if (['b08d52','af854e'].includes(c)) return {kind:'metal',roughness:0.5,metalness:0.3,bump:0.002};
    if (['a1a28b'].includes(c)) return {kind:'ceramic',roughness:0.36,metalness:0,bump:0.002};
    if (['892d26'].includes(c)) return {kind:'cloth',roughness:0.96,metalness:0,bump:0.004};
    if (material.transparent || material.emissiveIntensity > 0.4) return null;
    return {kind:'wood',roughness:0.78,metalness:0,bump:0.005};
  }
  return {kind:'stone',roughness:Math.max(0.55,material.roughness),metalness:material.metalness,bump:0.003};
}

export function makeSurfaceTextures(Texture) {
  const cache = new Map();
  function get(kind) {
    if (cache.has(kind)) return cache.get(kind);
    const size=256, canvas=document.createElement('canvas');canvas.width=canvas.height=size;
    const context=canvas.getContext('2d');const pixels=context.createImageData(size,size);
    let seed=314159;
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/4294967296;
      const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
      let h=0.45+noise*0.12;
      if(kind==='wood'||kind==='bark')h=0.5+0.22*Math.sin(u*23+Math.sin(v*2)*1.5)+0.08*Math.sin(u*61+Math.cos(v*4));
      else if(kind==='cloth')h=0.5+0.16*Math.cos(u*64)+0.16*Math.cos(v*64)+noise*0.05;
      else if(kind==='water')h=0.5+0.17*Math.sin(u*4+v*3)+0.09*Math.sin(u*7-v*5);
      else if(kind==='leaf')h=0.5+0.13*Math.cos(u*15+Math.abs(Math.sin(v))*8);
      const i=(y*size+x)*4,value=Math.max(0,Math.min(255,Math.round(h*255)));
      pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;pixels.data[i+3]=255;
    }
    context.putImageData(pixels,0,0);
    const texture=new Texture(canvas);texture.name=`精修 ${kind} 微表面`;texture.wrapS=texture.wrapT=1000;texture.anisotropy=4;texture.needsUpdate=true;
    cache.set(kind,texture);return texture;
  }
  return {get,dispose(){for(const t of cache.values())t.dispose();cache.clear();}};
}
