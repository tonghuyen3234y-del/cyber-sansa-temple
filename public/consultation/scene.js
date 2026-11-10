import { Easing, Group as TweenGroup, Tween } from './vendor/tween.js';

export const approach = { x: 14.15, z: 21.9 };
export const station = { x: 14.15, z: 19.55 };
const radius = 3.4;

export function makeSeat({ scene, player, height, types }) {
  const { Group, Mesh, Box, Sphere, Cylinder, Material, TextureLoader, colorSpace } = types;
  const root = new Group();
  root.name = '问心席';
  root.position.set(station.x, height(station.x, station.z), station.z);
  const geometries = new Set();
  const materials = new Set();
  let woodMap;
  let destroyed = false;

  function material(color, options = {}) {
    const result = new Material({ color, roughness: 0.83, ...options });
    materials.add(result);
    return result;
  }
  const timber = material('#725039');
  const edge = material('#634130');
  const cloth = material('#8d7861');
  const trim = material('#af854e');
  const sleeve = material('#625a4f');
  const skin = material('#d9ab7d');
  const mutedSkin = material('#b88163');
  const ink = material('#40312a');
  const ceramic = material('#a1a28b', { roughness: 0.42 });
  const paper = material('#dfc18f', { emissive: '#c18341', emissiveIntensity: 0.23 });
  const bamboo = material('#ceae70');
  const red = material('#a34e3f');

  function mesh(parent, geometry, finish, x, y, z) {
    const result = new Mesh(geometry, finish);
    result.position.set(x, y, z);
    result.receiveShadow = true;
    parent.add(result);
    geometries.add(geometry);
    return result;
  }
  const box = (parent, finish, x, y, z, w, h, d) => mesh(parent, new Box(w, h, d), finish, x, y, z);
  function round(parent, finish, x, y, z, w, h, d) {
    const result = mesh(parent, new Sphere(1, 16, 12), finish, x, y, z);
    result.scale.set(w, h, d);
    return result;
  }
  const cylinder = (parent, finish, x, y, z, a, b, h, open = false) =>
    mesh(parent, new Cylinder(a, b, h, 24, 1, open), finish, x, y, z);

  // Match the hall floor and wood without changing any shared materials or lights.
  new TextureLoader().load('/assets/materials/wood/color.jpg', map => {
    if (destroyed) { map.dispose(); return; }
    woodMap = map;
    map.colorSpace = colorSpace;
    timber.map = map;
    timber.needsUpdate = true;
  }, undefined, () => {});

  box(root, edge, 0, 0.64, 0, 2.12, 0.14, 1.02);
  box(root, timber, 0, 0.73, 0, 2.23, 0.085, 1.12);
  box(root, timber, 0, 0.51, 0.42, 1.99, 0.11, 0.11);
  for (const x of [-0.91, 0.91]) {
    for (const z of [-0.38, 0.38]) box(root, timber, x, 0.31, z, 0.14, 0.62, 0.14);
  }
  box(root, sleeve, -0.32, 0.09, -1.02, 1.15, 0.15, 0.84);
  box(root, edge, 0.75, 0.793, -0.29, 0.34, 0.045, 0.34);
  box(root, paper, 0.75, 0.99, -0.29, 0.24, 0.34, 0.24);
  box(root, edge, 0.75, 1.17, -0.29, 0.29, 0.045, 0.29);
  for (const x of [0.623, 0.877]) {
    for (const z of [-0.417, -0.163]) box(root, edge, x, 0.99, z, 0.027, 0.34, 0.027);
  }
  cylinder(root, ceramic, -0.69, 0.828, 0.31, 0.112, 0.08, 0.11);
  cylinder(root, sleeve, -0.69, 0.885, 0.31, 0.088, 0.088, 0.012);
  box(root, paper, -0.13, 0.778, 0.19, 0.40, 0.012, 0.23).rotation.y = 0.19;

  const monk = new Group();
  monk.name = '知客僧';
  monk.position.set(-0.32, 0, -0.98);
  root.add(monk);
  round(monk, sleeve, 0, 0.27, 0.12, 0.51, 0.18, 0.31);
  round(monk, cloth, 0, 0.62, 0.03, 0.40, 0.44, 0.25);
  round(monk, trim, -0.16, 0.70, 0.22, 0.105, 0.36, 0.038).rotation.z = 0.49;
  for (const side of [-1, 1]) {
    round(monk, cloth, side * 0.27, 0.63, 0.21, 0.15, 0.14, 0.20).rotation.y = -side * 0.43;
    round(monk, skin, side * 0.095, 0.60, 0.37, 0.08, 0.06, 0.09);
  }
  const head = new Group();
  head.position.y = 1.21;
  monk.add(head);
  round(head, skin, 0, 0, 0, 0.292, 0.325, 0.275);
  for (const side of [-1, 1]) {
    round(head, skin, side * 0.266, -0.065, 0.015, 0.068, 0.10, 0.052);
    round(head, ink, side * 0.101, -0.010, 0.255, 0.033, 0.011, 0.010).rotation.z = side * -0.18;
    round(head, sleeve, side * 0.105, 0.041, 0.253, 0.039, 0.010, 0.009).rotation.z = side * -0.14;
  }
  round(head, mutedSkin, 0, -0.104, 0.249, 0.045, 0.009, 0.016);
  round(head, skin, 0, -0.057, 0.274, 0.039, 0.036, 0.025);

  const shaker = new Group();
  shaker.name = '竹制签筒';
  shaker.position.set(0.51, 0.777, 0.27);
  root.add(shaker);
  const shell = cylinder(shaker, bamboo, 0, 0.185, 0, 0.177, 0.139, 0.37, true);
  shell.material.side = 2;
  cylinder(shaker, edge, 0, 0.345, 0, 0.174, 0.171, 0.035, true);
  cylinder(shaker, red, 0, 0.079, 0, 0.148, 0.144, 0.062);
  cylinder(shaker, red, 0, 0.287, 0, 0.173, 0.169, 0.025);
  const sticks = [];
  for (let i = 0; i < 10; i++) {
    const angle = i * 2.4;
    const length = 0.40 + (i % 4) * 0.032;
    const stick = box(shaker, i % 3 === 0 ? red : bamboo, Math.cos(angle) * 0.106,
      0.31 + length * 0.27, Math.sin(angle) * 0.106, 0.035, length, 0.019);
    stick.rotation.set(Math.sin(angle) * 0.13, 0, Math.cos(angle) * 0.13);
    sticks.push({ stick, y: stick.position.y });
  }
  const cupX = -0.54;
  const cupZ = 0.51;
  const tabletop = 0.779;
  const cups = [-1, 1].map(side => {
    const cup = new Group();
    cup.name = '筊杯';
    cup.position.set(cupX + side * 0.12, tabletop, cupZ);
    root.add(cup);
    const curve = mesh(cup, new Sphere(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), red, 0, 0, 0);
    curve.scale.set(0.078, 0.062, 0.151);
    const face = cylinder(cup, timber, 0, 0, 0, 1, 1, 0.01);
    face.scale.set(0.078, 1, 0.151);
    return cup;
  });
  const dropped = box(root, bamboo, 0.51, 1.47, 0.28, 0.051, 0.023, 0.53);
  const tip = box(dropped, red, 0, 0.002, 0.231, 0.052, 0.024, 0.062);
  tip.castShadow = false;
  dropped.visible = false;
  scene.add(root);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const timeline = new TweenGroup();
  const cupMotion = cups.map(() => ({ progress: 0 }));
  const slip = { progress: 0 };
  const motion = { lift: 0, tilt: 0 };
  let heldCups = null;
  let throws = [];
  let sound;
  let lastRattle = -Infinity;
  let slipSound = false;
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

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

  function tap(frequency, volume, duration = 0.1) {
    if (!sound || sound.state !== 'running' || !soundEnabled() || document.hidden) return;
    const level = Number(document.querySelector('#effects-volume')?.value ?? 35) / 100;
    const start = sound.currentTime;
    const wood = sound.createOscillator();
    const gain = sound.createGain();
    wood.type = 'triangle';
    wood.frequency.setValueAtTime(frequency, start);
    wood.frequency.exponentialRampToValueAtTime(frequency * 0.57, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * volume), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    wood.connect(gain).connect(sound.destination);
    wood.onended = () => { wood.disconnect(); gain.disconnect(); };
    wood.start(start);
    wood.stop(start + duration + 0.01);
  }
  let tiltTween;
  let slipTween;
  let started = -Infinity;
  let greetingAt = -Infinity;
  let faces = [];

  function tween(target, values, ms, delay = 0, easing = Easing.Linear.None) {
    const animation = new Tween(target).to(values, ms).delay(delay).easing(easing);
    timeline.add(animation);
    animation.onComplete(() => timeline.remove(animation)).start(performance.now());
    return animation;
  }

  function tilt(lift, tilt, ms) {
    if (tiltTween) { tiltTween.stop(); timeline.remove(tiltTween); }
    if (reduced.matches) Object.assign(motion, { lift: 0, tilt: 0 });
    else tiltTween = tween(motion, { lift, tilt }, ms, 0, Easing.Quadratic.Out);
  }

  function resetSlip() {
    if (slipTween) { slipTween.stop(); timeline.remove(slipTween); }
    slip.progress = 0;
    slipSound = false;
    dropped.visible = false;
  }

  function tick(time) {
    timeline.update(time);
    const t = Math.min(1, Math.max(0, (time - started) / 480));
    const wave = reduced.matches ? 0 : Math.sin(t * Math.PI);
    shaker.position.y = tabletop + motion.lift;
    shaker.rotation.z = Math.sin(t * 28) * wave * 0.19;
    shaker.rotation.x = motion.tilt + Math.sin(t * 20) * wave * 0.085;
    const rattle = Math.hypot(motion.lift, motion.tilt) * 0.2 + wave * 0.055;
    for (const [index, { stick, y }] of sticks.entries()) {
      stick.position.y = y + Math.sin(time * 0.042 + index) * rattle;
    }

    for (const [i, cup] of cups.entries()) {
      const side = i === 0 ? -1 : 1;
      if (heldCups) {
        cup.position.set(cupX + heldCups.dx + side * 0.10, tabletop + heldCups.lift, cupZ - 0.06);
        cup.rotation.set(heldCups.lift * 0.64, side * 0.23, heldCups.dx * 0.55);
        continue;
      }
      if (!faces.length) {
        cup.position.set(cupX + side * 0.12, tabletop, cupZ);
        cup.rotation.set(0, side * 0.31, 0);
        continue;
      }
      const progress = cupMotion[i].progress;
      const trajectory = throws[i];
      const air = Math.min(1, progress / 0.79);
      const slide = Easing.Quadratic.Out(progress);
      const bounce = progress > 0.79 ? Math.sin(Math.PI * (progress - 0.79) / 0.21) * 0.047 : 0;
      const flat = faces[i] === 'flat';
      const elevation = 4 * air * (1 - air) * trajectory.arc + trajectory.lift * (1 - air);
      cup.position.set(cupX + trajectory.dx * (1 - slide) + side * (0.10 + 0.075 * slide),
        tabletop + elevation + bounce + (flat ? 0.062 * air : 0), cupZ - 0.06 - 0.15 * slide);
      const rotation = Easing.Quadratic.Out(air);
      cup.rotation.set((Math.PI * 2 * trajectory.spins + (flat ? Math.PI : 0)) * rotation,
        side * (0.15 + 0.43 * slide), Math.sin(air * Math.PI) * side * 0.52);
      if (air >= 1 && !trajectory.hit) {
        trajectory.hit = true;
        tap(330 + 98 * i, 0.19, 0.13);
      }
    }

    if (dropped.visible) {
      const fall = slip.progress;
      const air = Math.min(1, fall / 0.81);
      if (air >= 1 && !slipSound) { slipSound = true; tap(540, 0.11, 0.095); }
      const bounce = fall > 0.81 ? Math.sin(Math.PI * (fall - 0.81) / 0.19) * 0.04 : 0;
      dropped.position.set(0.51 - 0.21 * fall, 0.79 + 0.68 * (1 - Easing.Quadratic.In(air)) + bounce, 0.27 + 0.14 * fall);
      dropped.rotation.set(-Math.PI / 2 * (1 - air) + Math.sin(air * Math.PI) * 0.55, -0.52 * fall, 0.25 * Math.sin(air * Math.PI));
    }
    const nod = (time - greetingAt) / 560;
    head.rotation.x = nod >= 0 && nod <= 1 && !reduced.matches ? Math.sin(nod * Math.PI) * 0.22 : 0;
  }

  return {
    root, monk, shaker, tick,
    near: () => Math.hypot(player.position.x - station.x, player.position.z - station.z) <= radius,
    props: { shaker, cups, dropped, timber, bamboo },
    enableSound,
    sway(height, velocity) {
      tilt(clamp(height * -0.26, 0, 0.27), clamp(velocity * 0.24, -0.32, 0.32), 68);
      const now = performance.now();
      if (Math.abs(velocity) > 0.19 && now - lastRattle > 67) {
        lastRattle = now;
        tap(575 + Math.random() * 225, 0.063, 0.058);
      }
    },
    settle() { tilt(0, 0, 240); },
    liftCups(dx, lift) {
      heldCups = { dx: clamp(dx / 330, -0.22, 0.22), lift: clamp(lift / 220, 0, 0.48) };
    },
    releaseCups() { heldCups = null; },
    cast(next, launch) {
      const from = heldCups || { dx: 0, lift: 0.15 };
      heldCups = null;
      faces = next;
      const skip = reduced.matches;
      const force = clamp((launch?.lift || 0) / 120, 0.2, 1);
      throws = cups.map((_, i) => ({
        ...from, arc: 0.25 + force * 0.22, spins: force > 0.68 ? 2 + i : 1 + i, hit: false,
      }));
      for (const [i, state] of cupMotion.entries()) {
        state.progress = skip ? 1 : 0;
        if (!skip) tween(state, { progress: 1 }, 750, i * 55);
      }
      return skip ? 0 : 810;
    },
    shake() {
      resetSlip();
      tilt(0, 0, 240);
      started = performance.now();
      return reduced.matches ? 0 : 365;
    },
    resetSlip,
    resetRitual() {
      faces = [];
      timeline.removeAll();
      motion.lift = motion.tilt = 0;
      heldCups = null;
      started = -Infinity;
      resetSlip();
    },
    reveal() {
      resetSlip();
      dropped.visible = true;
      if (reduced.matches) { slip.progress = 1; return 0; }
      slipTween = tween(slip, { progress: 1 }, 450);
      return 450;
    },
    greet() { greetingAt = performance.now(); },
    blocks(x, z) {
      const dx = x - station.x;
      const dz = z - station.z;
      return (Math.abs(dx) < 1.31 && Math.abs(dz) < 0.78) ||
        (Math.abs(dx + 0.32) < 0.77 && Math.abs(dz + 0.98) < 0.60);
    },
    dispose() {
      destroyed = true;
      timeline.removeAll();
      if (sound && sound.state !== 'closed') void sound.close().catch(() => {});
      root.removeFromParent();
      for (const geometry of geometries) geometry.dispose();
      for (const finish of materials) finish.dispose();
      woodMap?.dispose();
    },
  };
}
