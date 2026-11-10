// Meshes are batched by bough so foliage and its hanging points sway together.
export function buildWishTree(root, types) {
  const { Group, Mesh, Vector, Curve, Geometry, Attribute, Material, CanvasTexture,
    Color, repeatWrapping, doubleSide, colorSpace } = types;
  const geometries = [];
  const textures = [];
  let seed = 43871;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const bark = new Material({ color: '#b0a08b', roughness: 0.96, metalness: 0 });
  const leaves = new Material({ vertexColors: true, side: doubleSide, roughness: 0.9, metalness: 0 });
  bark.name = '古樟 bark';
  leaves.name = 'camphor leaves';
  const size = 256;
  const relief = new Float32Array(size * size);
  const tau = 2 * Math.PI;
  for (let y = 0; y < size; y++) {
    const v = y * tau / size;
    for (let x = 0; x < size; x++) {
      const u = x * tau / size;
      const drift = 0.078 * Math.sin(v) + 0.048 * Math.sin(v * 3 + u * 4);
      const furrow = 0.52 + 0.48 * Math.cos((u + drift) * 19 + Math.sin(u * 7));
      const grain = 0.5 + 0.5 * Math.cos((u + drift * 0.6) * 43 + 0.5 * Math.sin(v * 5));
      relief[y * size + x] = Math.pow(furrow, 0.38) * (0.72 + 0.16 * Math.sin(v * 9 + u * 11)) +
        grain * 0.16 + random() * 0.055;
    }
  }
  function barkTexture(normal) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(size, size);
    const sample = (x, y) => relief[((y + size) % size) * size + (x + size) % size];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        if (normal) {
          const dx = (sample(x - 1, y) - sample(x + 1, y)) * 2.8;
          const dy = (sample(x, y + 1) - sample(x, y - 1)) * 2.8;
          const length = Math.hypot(dx, dy, 1);
          image.data[i] = 128 + 127 * dx / length;
          image.data[i + 1] = 128 + 127 * dy / length;
          image.data[i + 2] = 128 + 127 / length;
        } else {
          const tone = 31 + sample(x, y) * 93;
          image.data[i] = tone * 1.15;
          image.data[i + 1] = tone * 0.99;
          image.data[i + 2] = tone * 0.79;
        }
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = repeatWrapping;
    texture.anisotropy = 4;
    if (!normal) texture.colorSpace = colorSpace;
    textures.push(texture);
    return texture;
  }
  bark.map = barkTexture(false);
  bark.normalMap = barkTexture(true);
  bark.normalScale.set(0.72, 0.72);

  function batch() {
    return { positions: [], uv: [], colors: [], index: [] };
  }
  const v = (x, y, z) => new Vector(x, y, z);
  function tube(out, points, radii, steps, sides, phase) {
    const path = new Curve(points);
    const frames = path.computeFrenetFrames(steps, false);
    const normal = v(0, 0, 0);
    const starts = out.positions.length / 3;
    const length = path.getLength();
    for (let row = 0; row <= steps; row++) {
      const t = row / steps;
      const point = path.getPointAt(t);
      const segment = Math.min(radii.length - 2, Math.floor(t * (radii.length - 1)));
      const k = t * (radii.length - 1) - segment;
      const radius = radii[segment] * (1 - k) + radii[segment + 1] * k;
      for (let side = 0; side <= sides; side++) {
        const a = side * tau / sides;
        const contour = 1 + 0.13 * Math.sin(3 * a + phase + t * 3) +
          0.07 * Math.sin(7 * a - t * 4);
        normal.copy(frames.normals[row]).multiplyScalar(Math.cos(a))
          .addScaledVector(frames.binormals[row], Math.sin(a));
        const offset = radius * contour;
        out.positions.push(point.x + normal.x * offset, point.y + normal.y * offset, point.z + normal.z * offset);
        out.uv.push(side / sides * (radii[0] > 0.85 ? 3 : 1) + phase, t * length / 2.6);
        if (row && side) {
          const end = starts + row * (sides + 1) + side;
          const upper = end - sides - 1;
          out.index.push(upper - 1, upper, end - 1, upper, end, end - 1);
        }
      }
    }
    return path;
  }

  function add(parent, out, finish) {
    const geometry = new Geometry();
    geometry.setAttribute('position', new Attribute(out.positions, 3));
    if (out.uv.length) geometry.setAttribute('uv', new Attribute(out.uv, 2));
    if (out.colors.length) geometry.setAttribute('color', new Attribute(out.colors, 3));
    geometry.setIndex(out.index);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    const mesh = new Mesh(geometry, finish);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    geometries.push(geometry);
    return mesh;
  }

  const trunk = batch();
  tube(trunk, [v(0, -0.55, 0), v(-0.16, 1.55, 0.11), v(0.3, 4.8, 0.08),
    v(-0.24, 7.6, 0.18), v(0.35, 9.8, -0.45), v(0.12, 12.1, -0.5)],
  [1.51, 1.08, 0.87, 0.63, 0.36, 0.035], 28, 24, 0.16);
  for (let i = 0; i < 8; i++) {
    const a = i * tau / 8 + random() * 0.36;
    const reach = 2.05 + random() * 0.57;
    tube(trunk, [v(Math.cos(a) * 0.65, 0.82, Math.sin(a) * 0.65),
      v(Math.cos(a + 0.18) * 1.55, 0.19, Math.sin(a + 0.18) * 1.55),
      v(Math.cos(a) * reach, -0.21, Math.sin(a) * reach)], [0.46, 0.29, 0.025], 9, 10, a);
  }
  const trunkMesh = add(root, trunk, bark);
  trunkMesh.name = '古樟树干与板根';

  const palette = ['#313e22', '#41532c', '#52663b', '#667746', '#7a8853', '#8a9459'].map(hex => new Color(hex));
  function cluster(out, center, radius, count) {
    const lengthAxis = v(0, 0, 0), sideAxis = v(0, 0, 0), worldUp = v(0, 1, 0);
    for (let i = 0; i < count; i++) {
      const angle = random() * tau, h = random() * 2 - 1;
      const r = Math.cbrt(random()) * Math.sqrt(1 - h * h);
      const x = center.x + Math.cos(angle) * r * radius;
      const y = center.y + h * radius * 0.67;
      const z = center.z + Math.sin(angle) * r * radius;
      const length = 0.15 + random() * 0.18;
      const width = length * (0.2 + random() * 0.11);
      const orientation = random() * tau;
      lengthAxis.set(Math.cos(orientation), -0.55 + random() * 1.04, Math.sin(orientation)).normalize();
      sideAxis.crossVectors(lengthAxis, worldUp).normalize();
      sideAxis.y = (random() - 0.5) * 0.77;
      const at = out.positions.length / 3;
      for (const [a, b, arch] of [[-0.5, 0, 0], [-0.08, -1, 0], [0.52, 0, -0.027], [-0.08, 1, 0], [0, 0, 0.038]]) {
        out.positions.push(x + a * length * lengthAxis.x + b * width * sideAxis.x,
          y + a * length * lengthAxis.y + b * width * sideAxis.y + arch,
          z + a * length * lengthAxis.z + b * width * sideAxis.z);
      }
      out.uv.push(0, 0.5, 0.42, 0, 1, 0.5, 0.42, 1, 0.5, 0.5);
      const color = palette[Math.min(palette.length - 1, Math.floor(random() * 4.8 + (h + 1) * 0.55))];
      for (let j = 0; j < 5; j++) {
        const tint = j === 4 ? 1.07 : 0.96 + random() * 0.12;
        out.colors.push(color.r * tint, color.g * tint, color.b * tint);
      }
      out.index.push(at, at + 1, at + 4, at + 1, at + 2, at + 4, at + 2, at + 3, at + 4, at + 3, at, at + 4);
    }
  }

  const boughs = [
    [0.55, 3.45, 5.25, 1.45], [-0.78, 4.05, 5.3, 1.85],
    [2.32, 4.7, 5.65, 2.5], [-2.38, 5.2, 5.65, 2.45],
    [1.32, 6.05, 5.35, 3.2], [-1.62, 6.6, 5.05, 3.55],
    [3.01, 7.45, 4.6, 3.95], [0.04, 8.85, 3.65, 4.25],
  ];
  const swayGroups = [];
  const anchors = [];
  const pickables = [trunkMesh];
  for (const [i, [angle, y, length, rise]] of boughs.entries()) {
    const group = new Group();
    group.position.set(y > 7 ? -0.12 : 0.14, y, 0.08);
    root.add(group);
    const d = v(Math.cos(angle), 0, Math.sin(angle));
    const lateral = v(-d.z, 0, d.x);
    const point = (distance, height, offset) => d.clone().multiplyScalar(distance)
      .addScaledVector(lateral, offset).add(v(0, height, 0));
    const wood = batch(), canopy = batch();
    const main = tube(wood, [v(0, 0, 0), point(length * 0.34, rise * 0.42, -0.32),
      point(length * 0.7, rise * 0.61, 0.45), point(length, rise, 0.15)],
    [0.56 - i * 0.032, 0.31 - i * 0.018, 0.14, 0.022], 15, 12, i * 0.13);
    for (let j = 0; j < 4; j++) {
      const t = 0.4 + j * 0.14;
      const start = main.getPointAt(t);
      const side = j % 2 ? -1 : 1;
      const end = start.clone().addScaledVector(d, 0.65 + random() * 1.15)
        .addScaledVector(lateral, side * (1.06 + random() * 1.25));
      end.y += 0.79 + random() * 1.05;
      const elbow = start.clone().lerp(end, 0.54);
      elbow.y -= 0.23;
      tube(wood, [start, elbow, end], [0.18 - j * 0.022, 0.085, 0.009], 8, 7, j * 0.31);
      cluster(canopy, end, 1.17 + random() * 0.67, 410);
      if (i < 2) {
        const hang = start.clone().lerp(elbow, 0.65);
        anchors.push({ group, x: hang.x, y: hang.y - 0.09, z: hang.z });
      }
    }
    cluster(canopy, main.getPointAt(0.94).add(v(0, 0.65, 0)), 1.55, 420);
    if (i >= 4) cluster(canopy, main.getPointAt(0.57).add(v(0, 1.45, 0)), 1.62, 420);
    for (const t of i < 2 ? [0.47, 0.73, 0.88] : [0.59, 0.83]) {
      const hang = main.getPointAt(t);
      anchors.push({ group, x: hang.x, y: hang.y - 0.13, z: hang.z });
    }
    pickables.push(add(group, wood, bark));
    add(group, canopy, leaves);
    swayGroups.push({ group, phase: i * 1.7, amount: 0.007 + (i % 3) * 0.003 });
  }

  return { anchors, swayGroups, pickables, geometries, materials: [bark, leaves], textures };
}
