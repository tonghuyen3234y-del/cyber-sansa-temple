import { Easing, Group as TweenGroup, Tween } from './vendor/tween.js';
import { buildWishTree } from './wish-tree-mesh.js';

// 莲池远岸。树根位于环道和石凳后方，互动点在石凳东侧。
export const tree = { x: -30, z: 52.6 };
export const approach = { x: -26.4, z: 49.1 };
const nearRadius = 5.7;
const trunkClearance = 2.75;
const wishCapacity = 12;
const shrine = { x: 1.38, z: -1.34 };

export function makeWishTree({ scene, player, height, types }) {
  const {
    Group, Mesh, Box, Plane, Sphere, Cylinder, Material, CanvasTexture, colorSpace,
  } = types;
  const base = height(tree.x, tree.z);
  const root = new Group();
  root.name = '许愿树';
  root.position.set(tree.x, base, tree.z);
  root.rotation.y = 0.98;
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  function material(color, options = {}) {
    const result = new Material({ color, roughness: 0.88, ...options });
    materials.add(result);
    return result;
  }
  const treeMesh = buildWishTree(root, types);
  for (const geometry of treeMesh.geometries) geometries.add(geometry);
  for (const finish of treeMesh.materials) materials.add(finish);
  for (const texture of treeMesh.textures) textures.add(texture);
  const { swayGroups, anchors, pickables } = treeMesh;
  const cinnabar = material('#a3433a', { roughness: 0.62 });
  const rope = material('#892d26', { roughness: 0.98 });
  const gold = material('#b08d52', { roughness: 0.42, metalness: 0.16 });
  const stone = material('#7f8077', { roughness: 0.95 });
  const stoneDark = material('#6a6b62', { roughness: 0.95 });

  function mesh(parent, geometry, finish, x, y, z) {
    const result = new Mesh(geometry, finish);
    result.position.set(x, y, z);
    result.receiveShadow = true;
    parent.add(result);
    geometries.add(geometry);
    return result;
  }
  const box = (parent, finish, x, y, z, w, h, d) => mesh(parent, new Box(w, h, d), finish, x, y, z);
  const cylinder = (parent, finish, x, y, z, r1, r2, h, radial = 9) =>
    mesh(parent, new Cylinder(r1, r2, h, radial), finish, x, y, z);

  // 青石香案与一旁的旧石碑。
  const table = new Group();
  table.position.set(shrine.x, 0, shrine.z);
  root.add(table);
  box(table, stone, 0, 0.62, 0, 1.35, 0.14, 0.62);
  box(table, stoneDark, 0, 0.28, 0, 1.16, 0.34, 0.46);
  box(table, stone, 0, 0.47, 0, 1.24, 0.08, 0.52);
  for (const side of [-1, 1]) box(table, stoneDark, side * 0.5, 0.14, 0.0, 0.14, 0.2, 0.3);
  const censer = cylinder(table, gold, 0, 0.78, 0, 0.17, 0.13, 0.2, 14);
  censer.castShadow = true;
  cylinder(table, stoneDark, 0, 0.9, 0, 0.13, 0.11, 0.05, 12);
  // 三炷香，香头用一点暖色。
  const ember = material('#d98a52', { emissive: '#c46a34', emissiveIntensity: 0.8, roughness: 0.6 });
  for (const [dx, dz, height2] of [[-0.05, 0.01, 0.46], [0, -0.03, 0.5], [0.05, 0.02, 0.44]]) {
    const stick = cylinder(table, rope, dx, 0.9 + height2 / 2, dz, 0.008, 0.007, height2, 5);
    stick.castShadow = false;
    mesh(table, new Sphere(0.014, 6, 5), ember, dx, 0.9 + height2, dz);
  }
  const tablet = new Group();
  tablet.position.set(-1.5, 0, -0.3);
  tablet.rotation.y = 0.34;
  root.add(tablet);
  box(tablet, stoneDark, 0, 0.12, 0, 0.86, 0.24, 0.4);
  const slab = box(tablet, stone, 0, 0.78, 0, 0.62, 1.15, 0.16);
  slab.castShadow = true;
  box(tablet, stoneDark, 0, 1.4, 0, 0.52, 0.14, 0.22);

  // 双面朱漆木牌，枝条摆动时也能看到题字和落款。
  const plaqueWidth = 0.42;
  const plaqueHeight = 0.52;
  const boardGeometry = new Box(plaqueWidth, plaqueHeight, 0.036);
  const printGeometry = new Plane(plaqueWidth - 0.03, plaqueHeight - 0.03);
  const cordGeometry = new Cylinder(0.012, 0.012, 0.30, 6);
  const knotGeometry = new Sphere(0.026, 8, 6);
  const plaques = [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function paint(entry) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 320;
    const brush = canvas.getContext('2d');
    if (!brush) return null;
    const wood = brush.createLinearGradient(0, 0, 256, 320);
    wood.addColorStop(0, '#b8634a');
    wood.addColorStop(0.5, '#a84f3c');
    wood.addColorStop(1, '#8f4032');
    brush.fillStyle = wood;
    brush.fillRect(0, 0, 256, 320);
    brush.strokeStyle = '#7a3227';
    brush.lineWidth = 8;
    brush.strokeRect(4, 4, 248, 312);
    brush.strokeStyle = '#d9a06a44';
    brush.lineWidth = 2;
    brush.strokeRect(18, 18, 220, 284);
    brush.fillStyle = '#f6e2bd';
    brush.textAlign = 'center';
    brush.textBaseline = 'middle';
    const title = [...(entry.title || '一念')].slice(0, 4);
    brush.font = (title.length <= 2 ? '600 86px' : '600 62px') +
      ' "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", serif';
    brush.fillText(title.join(''), 128, 122);
    brush.font = '26px "Songti SC", "Noto Serif CJK SC", serif';
    brush.fillStyle = '#eccfa6dd';
    brush.fillText(entry.date || '', 128, 236);
    if (entry.name) {
      brush.fillStyle = '#f6e2bd';
      brush.font = '24px "Songti SC", serif';
      brush.fillText(entry.name, 128, 274);
    }
    // 木纹与钉孔
    brush.strokeStyle = '#5f241c33';
    for (let index = 0; index < 9; index++) {
      brush.lineWidth = 1 + (index % 3);
      brush.beginPath();
      brush.moveTo(0, 24 + index * 34);
      brush.bezierCurveTo(78, 16 + index * 34, 168, 34 + index * 34, 256, 22 + index * 34);
      brush.stroke();
    }
    brush.fillStyle = '#4b1d16';
    brush.beginPath();
    brush.arc(128, 34, 7, 0, Math.PI * 2);
    brush.fill();
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = colorSpace;
    textures.add(texture);
    return texture;
  }

  const owned = new Map();
  const oldTitles = ['平安', '心安', '顺遂', '团圆', '归处'];
  for (const [index, anchor] of anchors.entries()) {
    const group = new Group();
    const cord = mesh(group, cordGeometry, rope, 0, -0.14, 0);
    cord.receiveShadow = false;
    const knot = mesh(group, knotGeometry, rope, 0, 0.005, 0);
    knot.receiveShadow = false;
    const board = new Mesh(boardGeometry, cinnabar);
    board.position.y = -0.37;
    board.castShadow = false;
    board.receiveShadow = true;
    geometries.add(boardGeometry);
    group.add(board);
    const tint = index % 2;
    const face = new Mesh(printGeometry, material('#ffffff', { roughness: 0.7 }));
    geometries.add(printGeometry);
    face.position.set(0, -0.37, 0.0205);
    const back = face.clone();
    back.position.z = -0.0205;
    back.rotation.y = Math.PI;
    group.add(face, back);
    const baseY = anchor.y - 0.08 - (tint ? 0.06 : 0);
    group.position.set(anchor.x, baseY, anchor.z);
    anchor.group.add(group);
    const offset = (index * 0.618) % 1;
    const facing = 1.02 + (offset - 0.5) * 0.83;
    group.rotation.y = facing;
    const plaque = {
      group, anchor, board, facing,
      phase: index * 0.913,
      idle: 0.028 + offset * 0.03,
      baseY, material: face.material,
    };
    plaques.push(plaque);
    pickables.push(board);
    entryFor(plaque, { title: oldTitles[index % oldTitles.length], date: '', name: '' });
  }
  function entryFor(plaque, entry) {
    const texture = paint(entry);
    if (!texture) return;
    const previous = plaque.material.map;
    if (previous) {
      textures.delete(previous);
      previous.dispose();
    }
    plaque.entry = entry;
    plaque.material.map = texture;
    plaque.material.needsUpdate = true;
  }

  function place(entry) {
    let plaque = owned.get(entry.key);
    if (!plaque && owned.size >= wishCapacity) {
      const [key, oldest] = owned.entries().next().value;
      owned.delete(key);
      plaque = oldest;
    }
    plaque ??= plaques.find(item => !item.entry?.key);
    entryFor(plaque, entry);
    owned.set(entry.key, plaque);
    return plaque;
  }

  scene.add(root);
  const timeline = new TweenGroup();
  let sound;
  let lastChime = -Infinity;

  function soundEnabled() {
    return document.querySelector('#audio-toggle[aria-checked="true"]') &&
      document.querySelector('#effects-toggle[aria-checked="true"]');
  }
  function enableSound() {
    if (!soundEnabled()) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try { sound ??= new Audio(); } catch { return; }
    if (sound.state === 'suspended') void sound.resume().catch(() => {});
  }
  function chime(volume = 0.09) {
    if (!sound || sound.state !== 'running' || !soundEnabled() || document.hidden) return;
    const now = performance.now();
    if (now - lastChime < 90) return;
    lastChime = now;
    const level = Number(document.querySelector('#effects-volume')?.value ?? 35) / 100;
    const start = sound.currentTime;
    for (const [index, ratio] of [1, 2.02, 2.97].entries()) {
      const tone = sound.createOscillator();
      const gain = sound.createGain();
      tone.type = 'sine';
      tone.frequency.setValueAtTime(1180 * ratio, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * volume / (index + 1.2)), start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5 + index * 0.16);
      tone.connect(gain).connect(sound.destination);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
      tone.start(start);
      tone.stop(start + 0.7 + index * 0.2);
    }
  }

  function tick(time) {
    timeline.update(time);
    for (const plaque of plaques) {
      if (!plaque.group.parent) continue;
      if (plaque.pulseAt) {
        const k = (time - plaque.pulseAt) / 1100;
        if (k > 1) { plaque.group.scale.setScalar(1); plaque.pulseAt = 0; }
        else plaque.group.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.16);
      }
      const swaying = !reduced.matches;
      const idle = Math.sin(time * 0.00082 + plaque.phase) * plaque.idle;
      const motion = plaque.motion;
      const lift = motion ? motion.progress : 0;
      if (swaying) plaque.group.rotation.z = idle + (motion ? Math.sin(time * (0.009 + plaque.phase * 0.001)) * 0.32 * (1 - lift) : 0);
      if (motion) {
        // 从桌面位置升到树枝：先升起，再横向移动，最后挂上并轻晃。
        const t = motion.progress;
        const rise = Math.min(1, t / 0.62);
        const across = Math.max(0, (t - 0.32) / 0.68);
        const from = motion.from;
        const to = motion.to;
        plaque.group.position.set(
          from.x + (to.x - from.x) * Easing.Cubic.Out(across),
          from.y + (to.y - from.y) * Easing.Quadratic.Out(rise) + Math.sin(rise * Math.PI) * 0.02,
          from.z + (to.z - from.z) * Easing.Cubic.Out(across));
        plaque.group.rotation.z = idle + Math.sin(t * Math.PI * 3) * 0.5 * (1 - t);
        plaque.group.rotation.y = plaque.facing + Math.sin(t * Math.PI * 2) * 0.9 * (1 - t);
        if (!motion.chimed && t > 0.86) {
          motion.chimed = true;
          chime(0.1);
        }
      }
    }
    for (const sway of swayGroups) {
      // 枝条整体轻微的呼吸感，周期长、幅度小，风起时才有感觉。
      if (reduced.matches) { sway.group.rotation.set(0, 0, 0); continue; }
      sway.group.rotation.z = Math.sin(time * 0.00043 + sway.phase) * sway.amount;
      sway.group.rotation.x = Math.cos(time * 0.00037 + sway.phase * 1.3) * sway.amount * 0.6;
    }
    const emberLevel = 0.7 + Math.sin(time * 0.0031) * 0.16 + Math.sin(time * 0.00071) * 0.1;
    ember.emissiveIntensity = Math.max(0.35, emberLevel);
  }

  function finish(plaque) {
    plaque.motion = undefined;
    plaque.group.position.set(plaque.anchor.x, plaque.baseY, plaque.anchor.z);
    plaque.group.rotation.set(0, plaque.facing, 0);
  }

  return {
    root,
    tick,
    pickables,
    focusPoint(target) {
      return target.set(tree.x, root.position.y + 2.45, tree.z);
    },
    near: () => Math.hypot(player.position.x - tree.x, player.position.z - tree.z) <= nearRadius,
    restore(entries) {
      for (const entry of entries.slice(0, wishCapacity).reverse()) place(entry);
    },
    hang(entry) {
      const plaque = place(entry);
      const to = { x: plaque.anchor.x, y: plaque.baseY, z: plaque.anchor.z };
      const origin = root.localToWorld(new types.Vector(shrine.x, 1.36, shrine.z));
      const local = plaque.anchor.group.worldToLocal(origin);
      plaque.motion = { progress: 0, from: local, to, chimed: false };
      if (reduced.matches) {
        finish(plaque);
        chime(0.08);
        return Promise.resolve();
      }
      const duration = 1250;
      const animation = new Tween(plaque.motion).to({ progress: 1 }, duration).easing(Easing.Linear.None);
      timeline.add(animation);
      return new Promise(resolve => {
        animation.onComplete(() => {
          timeline.remove(animation);
          finish(plaque);
          resolve();
        }).start(performance.now());
      });
    },
    /** 让已挂上的木牌轻轻放大一下，提示「就是这一枝」。 */
    bringIntoView(key) {
      const plaque = owned.get(key);
      if (!plaque) return null;
      plaque.pulseAt = performance.now();
      return plaque.board;
    },
    chime,
    enableSound,
    blocks(x, z) {
      return Math.hypot(x - tree.x, z - tree.z) < trunkClearance;
    },
    dispose() {
      timeline.removeAll();
      if (sound && sound.state !== 'closed') void sound.close().catch(() => {});
      root.removeFromParent();
      for (const texture of textures) texture.dispose();
      for (const geometry of geometries) geometry.dispose();
      for (const finish of materials) finish.dispose();
    },
  };
}
