// Content-addressed geometry assets: independent of UUIDs and scene traversal order.
const keys = new WeakMap();
export function geometryKey(geometry) {
  if (keys.has(geometry)) return keys.get(geometry);
  let a = 2166136261, b = 5381;
  const feed = value => { a = Math.imul(a ^ value, 16777619); b = Math.imul(b, 33) ^ value; };
  for (const name of ['position', 'normal', 'uv', 'color']) {
    const attr = geometry.attributes[name];
    feed(attr?.count || 0); feed(attr?.itemSize || 0);
    if (!attr) continue;
    // Hash normalized values so both ordinary and interleaved attributes work.
    const temp = new Float32Array(attr.count * attr.itemSize);
    for (let i = 0; i < attr.count; i++) for (let k = 0; k < attr.itemSize; k++) temp[i * attr.itemSize + k] = attr.getComponent(i, k);
    const bytes = new Uint8Array(temp.buffer);
    for (const value of bytes) feed(value);
  }
  const idx = geometry.index;
  feed(idx?.count || 0);
  if (idx) for (let i = 0; i < idx.count; i++) feed(idx.getX(i));
  for (const g of geometry.groups) { feed(g.start); feed(g.count); feed(g.materialIndex); }
  const result = `${(a >>> 0).toString(16)}-${(b >>> 0).toString(16)}`;
  keys.set(geometry, result);
  return result;
}

export function refinementKind(object) {
  const g = object.geometry;
  const materials = [object.material].flat();
  if (object.isSkinnedMesh || g.attributes.skinIndex || Object.keys(g.morphAttributes).length ||
      Object.keys(g.attributes).some(k => !['position','normal','uv','uv1','uv2','color','tangent'].includes(k)) ||
      materials.length !== 1 || !materials[0]?.isMeshStandardMaterial ||
      materials[0].transparent || materials[0].alphaTest > 0 || materials[0].userData.sceneRayPassthrough) return 'surface';
  if (['SphereGeometry','TorusGeometry'].includes(g.type) && g.attributes.position.count < 6000) return 'smooth';
  if (g.type === 'BoxGeometry') return 'bevel';
  if (g.type === 'CylinderGeometry' && g.parameters?.openEnded !== true) return 'bevel';
  const name = `${object.name} ${materials[0].name}`;
  if (/timber|walnut|brackets|stone foundation|flagstone|path stones|bronze offering|brass details|charcoal mountain gate|pigment|party trim|DJ equipment/i.test(name)) return 'bevel';
  return 'surface';
}
