import { registerRefinementScene } from '/refinement/refinement.js';
export function makePreview(types, props) {
  const {
    Renderer, Scene, Camera, Group, Mesh, Box, Plane, CanvasTexture,
    HemisphereLight, DirectionalLight, colorSpace, toneMapping,
  } = types;
  const renderer = new Renderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = colorSpace;
  renderer.toneMapping = toneMapping;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene();
  const unregisterRefinement = registerRefinementScene(scene);
  const camera = new Camera(36, 1, 0.05, 12);
  const key = new DirectionalLight('#fff2db', 2.1);
  key.position.set(-2.2, 4, 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(512, 512);
  Object.assign(key.shadow.camera, { left: -1.3, right: 1.3, top: 1.3, bottom: -1.3, near: 0.2, far: 9 });
  key.shadow.bias = -0.0002;
  renderer.shadowMap.enabled = true;
  scene.add(key, new HemisphereLight('#fff6e5', '#a98a62', 2.05));

  const shaker = props.shaker.clone();
  const cups = props.cups.map(cup => cup.clone());
  const dropped = props.dropped.clone();
  const baseGeometry = new Box(1.52, 0.048, 0.90);
  const base = new Mesh(baseGeometry, props.timber);
  base.position.set(0, -0.025, -0.035);
  base.receiveShadow = true;
  for (const object of [shaker, ...cups, dropped]) {
    object.traverse(part => { if (part.isMesh) part.castShadow = true; });
  }
  scene.add(base, shaker, ...cups, dropped);

  const sign = new Group();
  const wood = props.bamboo.clone();
  const ink = props.bamboo.clone();
  ink.transparent = true;
  ink.color.set('#ffffff');
  ink.depthWrite = false;
  const boardGeometry = new Box(0.185, 0.81, 0.032);
  const printGeometry = new Plane(0.182, 0.806);
  sign.add(new Mesh(boardGeometry, wood));
  const face = new Mesh(printGeometry, ink);
  face.position.z = 0.0168;
  sign.add(face);
  const reverse = face.clone();
  reverse.position.z = -0.0168;
  reverse.rotation.y = Math.PI;
  sign.add(reverse);
  scene.add(sign);
  const label = document.createElement('canvas');
  label.width = 192;
  label.height = 768;
  const brush = label.getContext('2d');
  const texture = new CanvasTexture(label);
  texture.colorSpace = colorSpace;
  ink.map = texture;
  ink.needsUpdate = true;

  function print(number) {
    if (!brush) return;
    brush.clearRect(0, 0, 192, 768);
    brush.strokeStyle = '#e9c995';
    brush.lineWidth = 4;
    brush.strokeRect(16, 16, 160, 736);
    brush.fillStyle = '#773d2a';
    brush.fillRect(35, 45, 122, 47);
    brush.fillStyle = '#f8e6c3';
    brush.font = '24px serif';
    brush.textAlign = 'center';
    brush.fillText('觀音籤', 96, 77);
    brush.fillStyle = '#fff0bf';
    brush.font = 'bold 57px serif';
    brush.fillText(String(number).padStart(2, '0'), 96, 300);
    brush.font = '30px serif';
    brush.fillText('第', 96, 211);
    brush.fillText('籤', 96, 363);
    texture.needsUpdate = true;
  }

  let mode;
  let origin;
  let width = 0;
  let height = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function copy(target, source, x = 0, z = 0) {
    target.position.copy(source.position);
    target.position.x -= x;
    target.position.y -= 0.77;
    target.position.z -= z;
    target.quaternion.copy(source.quaternion);
  }

  return {
    display(next, host, card) {
      if (mode === next && origin === host) return;
      origin = host;
      mode = next;
      if (renderer.domElement.parentElement !== host) host.prepend(renderer.domElement);
      width = height = 0;
      if (card) print(card.number);
    },
    render(time) {
      if (!origin?.isConnected || !origin.clientWidth || !origin.clientHeight) return;
      if (width !== origin.clientWidth || height !== origin.clientHeight) {
        width = origin.clientWidth;
        height = origin.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      const holding = mode === 'shake' || mode === 'fall';
      shaker.visible = holding;
      for (const cup of cups) cup.visible = mode === 'confirmation';
      dropped.visible = mode === 'fall' && props.dropped.visible;
      sign.visible = mode === 'reveal';
      base.visible = !sign.visible;
      if (holding) {
        copy(shaker, props.shaker, 0.48, 0.27);
        for (const [i, child] of shaker.children.entries()) {
          child.position.copy(props.shaker.children[i].position);
        }
        copy(dropped, props.dropped, 0.48, 0.27);
        camera.position.set(0.98, 0.75, 1.47);
        camera.lookAt(0, 0.31, 0);
      } else if (mode === 'confirmation') {
        for (const [i, cup] of cups.entries()) copy(cup, props.cups[i], -0.54, 0.45);
        camera.position.set(0.38, 0.94, 1.22);
        camera.lookAt(0, 0.21, 0);
      } else {
        if (props.timber.map && wood.map !== props.timber.map) {
          wood.map = props.timber.map;
          wood.needsUpdate = true;
        }
        sign.rotation.set(0.035, reduced.matches ? 0.16 : Math.sin(time / 850) * 0.63, -0.075);
        camera.position.set(0, 0, 1.64);
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
    },
    dispose() {
      unregisterRefinement();
      origin = undefined;
      renderer.domElement.remove();
      renderer.dispose();
      renderer.forceContextLoss();
      for (const resource of [texture, boardGeometry, printGeometry, baseGeometry, wood, ink]) resource.dispose();
    },
  };
}
