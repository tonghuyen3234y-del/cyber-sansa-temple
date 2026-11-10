import { Group as TweenGroup, Tween } from './vendor/tween.js';

const canvasWidth = 512;
const canvasHeight = 680;
const family = '"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "STSong", serif';

function roundRect(brush, x, y, width, height, radius) {
  brush.beginPath();
  brush.moveTo(x + radius, y);
  brush.arcTo(x + width, y, x + width, y + height, radius);
  brush.arcTo(x + width, y + height, x, y + height, radius);
  brush.arcTo(x, y + height, x, y, radius);
  brush.arcTo(x, y, x + width, y, radius);
  brush.closePath();
}

/**
 * 竖排落笔：每个字自上而下，行自右向左。
 */
function verticalText(brush, text, right, top, size, gap = 1.12) {
  const chars = [...text];
  brush.textAlign = 'center';
  brush.textBaseline = 'middle';
  let x = right;
  let y = top;
  for (const char of chars) {
    if (y > canvasHeight - size) {
      x -= size * gap;
      y = top;
    }
    brush.fillText(char, x, y + size / 2);
    y += size * gap;
  }
  return x;
}

export function makePlaquePainter(types) {
  const { CanvasTexture, colorSpace } = types;
  return function paint(host, state) {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const brush = canvas.getContext('2d');
    const revealed = Math.max(0, Math.min(1, state.progress ?? 1));

    // 木牌底色：朱漆一件，纹路顺着木纹走。
    const wood = brush.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    wood.addColorStop(0, '#b8664b');
    wood.addColorStop(0.45, '#a54f3b');
    wood.addColorStop(1, '#8a3d30');
    brush.fillStyle = wood;
    brush.fillRect(0, 0, canvasWidth, canvasHeight);
    brush.save();
    brush.globalAlpha = 0.14;
    brush.strokeStyle = '#5f241c';
    for (let index = 0; index < 26; index++) {
      brush.lineWidth = 1 + (index % 4) * 0.7;
      brush.beginPath();
      brush.moveTo(0, 16 + index * 26);
      brush.bezierCurveTo(150, 4 + index * 26, 350, 30 + index * 26, canvasWidth, 12 + index * 26);
      brush.stroke();
    }
    brush.restore();

    // 描金边框与暗角。
    brush.strokeStyle = '#6f2b20';
    brush.lineWidth = 14;
    brush.strokeRect(7, 7, canvasWidth - 14, canvasHeight - 14);
    brush.strokeStyle = '#e8c68d55';
    brush.lineWidth = 2;
    brush.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60);
    const vignette = brush.createRadialGradient(canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.28,
      canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.78);
    vignette.addColorStop(0, '#00000000');
    vignette.addColorStop(1, '#3d120b4d');
    brush.fillStyle = vignette;
    brush.fillRect(0, 0, canvasWidth, canvasHeight);

    // 系绳孔
    brush.fillStyle = '#4b1d16';
    brush.beginPath();
    brush.arc(canvasWidth / 2, 52, 12, 0, Math.PI * 2);
    brush.fill();
    brush.strokeStyle = '#e8c68d66';
    brush.lineWidth = 3;
    brush.beginPath();
    brush.arc(canvasWidth / 2, 52, 18, 0, Math.PI * 2);
    brush.stroke();

    const title = state.title || '一念';
    brush.fillStyle = '#f7e6c4';
    brush.shadowColor = '#3a120a99';
    brush.shadowBlur = 8;
    const titleSize = [...title].length <= 2 ? 150 : 104;
    brush.font = `600 ${titleSize}px ${family}`;
    verticalText(brush, title, canvasWidth / 2, 118, titleSize, 1.1);
    brush.shadowBlur = 0;

    // 心愿正文逐字落墨
    brush.fillStyle = '#f3ddb7';
    const bodySize = 30;
    brush.font = `${bodySize}px ${family}`;
    const body = [...(state.wish || '')].filter(char => !/[\s，。；、,]/.test(char)).slice(0, 40);
    const shown = Math.round(body.length * revealed);
    const bodyChars = body.slice(0, shown);
    const columns = Math.ceil(bodyChars.length / 16) || 1;
    let cursor = -1;
    const right = canvasWidth / 2 - 96;
    let column = 0;
    let rowY = 118 + titleSize * 1.24 + bodySize;
    const startY = rowY;
    for (const [index, char] of bodyChars.entries()) {
      cursor = index;
      const columnIndex = Math.floor(index / 16);
      const rowIndex = index % 16;
      const x = right - columnIndex * (bodySize * 1.35);
      const y = startY + rowIndex * (bodySize * 1.18);
      if (y > canvasHeight - 150) break;
      brush.fillText(char, x, y);
      column = columnIndex;
      rowY = y;
    }
    void columns; void cursor; void column; void rowY;

    // 落款与日期
    brush.fillStyle = '#efd3a6cc';
    brush.font = `22px ${family}`;
    if (state.name) {
      brush.textAlign = 'center';
      brush.fillText(state.name, canvasWidth / 2, canvasHeight - 118);
    }
    brush.font = `24px ${family}`;
    brush.fillStyle = '#e9c995cc';
    brush.textAlign = 'center';
    brush.fillText(state.date || '', canvasWidth / 2, canvasHeight - 78);
    brush.fillStyle = '#c9936b88';
    brush.font = `18px ${family}`;
    brush.fillText('赛博山寺 · 许愿树', canvasWidth / 2, canvasHeight - 44);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = colorSpace;
    if (host) {
      host.map = texture;
      host.needsUpdate = true;
    }
    return texture;
  };
}

/**
 * 木牌在卡片里的飘动：主画面外的一层轻动画，用 CPU 生成即可，不开第二个 WebGL 上下文。
 */
export function makeFloatingPlaque(types, paint) {
  const { Renderer, Scene, Camera, Group, Mesh, Box, Plane, HemisphereLight, DirectionalLight,
    colorSpace, toneMapping, Vector } = types;
  const renderer = new Renderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = colorSpace;
  renderer.toneMapping = toneMapping;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene();
  const camera = new Camera(34, 1, 0.1, 12);
  camera.position.set(0, 0.02, 2.55);
  camera.lookAt(0, 0, 0);
  const key = new DirectionalLight('#fff0d4', 2.35);
  key.position.set(-1.7, 2.6, 2.4);
  const fill = new HemisphereLight('#fff6e6', '#7d6a4d', 1.9);
  scene.add(key, fill);

  const pivot = new Group();
  scene.add(pivot);
  // 系绳与木牌
  const cordGeometry = new Box(0.014, 0.5, 0.014);
  const cord = new Mesh(cordGeometry, new (types.Material)({ color: '#8a6a45', roughness: 0.9 }));
  cord.position.y = 0.72;
  const boardGeometry = new Box(0.86, 1.14, 0.06);
  const faceGeometry = new Plane(0.82, 1.1);
  const material = new (types.Material)({ color: '#ffffff', roughness: 0.72 });
  const backMaterial = new (types.Material)({ color: '#8a3d30', roughness: 0.78 });
  const board = new Mesh(boardGeometry, backMaterial);
  const face = new Mesh(faceGeometry, material);
  face.position.z = 0.0315;
  const back = new Mesh(faceGeometry, backMaterial);
  back.position.z = -0.0315;
  back.rotation.y = Math.PI;
  const plaque = new Group();
  plaque.add(cord, board, face, back);
  pivot.add(plaque);
  const top = new Vector(0, 0.5, 0);

  let state = null;
  let width = 0;
  let height = 0;
  let lastShown = -1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  return {
    element() { return renderer.domElement; },
    paint(next, progress) {
      state = next;
      lastShown = -1;
      if (progress !== undefined) paint(material, { ...next, progress });
    },
    repaint(progress) {
      if (!state) return;
      const rounded = Math.round(progress * 40) / 40;
      if (rounded === lastShown) return;
      lastShown = rounded;
      paint(material, { ...state, progress: rounded });
    },
    render(host, time) {
      if (!host?.isConnected || !host.clientWidth || !host.clientHeight) return;
      if (width !== host.clientWidth || height !== host.clientHeight) {
        width = host.clientWidth;
        height = host.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (renderer.domElement.parentElement !== host) host.prepend(renderer.domElement);
      }
      const sway = reduced.matches ? 0 : Math.sin(time / 1400) * 0.13;
      const bob = reduced.matches ? 0 : Math.sin(time / 1730) * 0.022;
      pivot.position.y = bob;
      pivot.rotation.z = sway * 0.42;
      pivot.rotation.y = reduced.matches ? 0.12 : Math.sin(time / 2600) * 0.4 + 0.05;
      pivot.rotation.x = reduced.matches ? 0 : Math.cos(time / 3100) * 0.045;
      board.position.copy(top);
      renderer.render(scene, camera);
    },
    dispose() {
      renderer.domElement.remove();
      renderer.dispose();
      renderer.forceContextLoss();
      for (const resource of [cordGeometry, boardGeometry, faceGeometry, material, backMaterial, cord.material]) resource.dispose();
    },
  };
}

export function createTween(timeline) {
  return (target, values, ms, delay = 0) => {
    const animation = new Tween(target).to(values, ms).delay(delay).easing(Tween.Easing?.Quadratic?.Out ?? undefined);
    timeline.add(animation);
    animation.onComplete(() => timeline.remove(animation)).start(performance.now());
    return animation;
  };
}

export { TweenGroup };
