import { marble } from './marble-config.js';

// The original meshes remain on the picker's original layers. The camera
// and shadow pass skip layer 30, so these meshes write neither color nor depth.
const proxyLayer = 30;
function hideEnvironment(roots, originalLayers) {
  function visit(object) {
    if (object.userData.keepInMarble) return;
    if ((object.isMesh || object.isPoints || object.isLine || object.isSprite) &&
        !originalLayers.has(object)) {
      const mask = object.layers.mask;
      originalLayers.set(object, mask);
      object.userData.legacyEnvironmentPickMask = mask;
      object.layers.set(proxyLayer);
    }
    for (const child of object.children) visit(child);
  }
  for (const root of roots) visit(root);
}

export function mountEnvironment({ scene, camera, renderer, Group, roots, prepareLegacy, signal, refresh }) {
  void import('/refinement/refinement.js').then(({mountRefinement}) => {
    if (!signal.aborted) mountRefinement({scene, renderer, signal, refresh});
  }).catch(error => console.warn('精修模块加载失败，保留原版', error));
  const control = document.querySelector('#temple-environment');
  const status = document.querySelector('#temple-environment-status');
  const canvas = renderer.domElement;
  const originalLayers = new Map();
  let pending;
  let active;

  function showStatus(state, message) {
    canvas.dataset.environment = state;
    status.textContent = message;
  }

  function stopMarble() {
    pending?.abort();
    pending = undefined;
    const environment = active;
    active = undefined;
    environment?.group.removeFromParent();

    for (const [object, mask] of originalLayers) {
      object.layers.mask = mask;
      delete object.userData.legacyEnvironmentPickMask;
    }
    originalLayers.clear();
    environment?.spark.dispose();
    environment?.splats.dispose();
    refresh();
  }

  async function startMarble() {
    const loading = new AbortController();
    pending = loading;
    showStatus('loading', '正在加载写实环境。加载期间显示原场景。');
    let staged;
    try {
      const response = await fetch(marble.asset, { signal: loading.signal });
      if (response.status === 404) {
        control.value = 'original';
        showStatus('missing', '未找到「寺庙写实环境.spz」，已保留原场景。');
        return;
      }
      if (!response.ok) throw new Error(`SPZ 请求失败 (${response.status})`);
      const fileBytes = new Uint8Array(await response.arrayBuffer());
      const { SparkRenderer, SplatFileType, SplatMesh } = await import('@sparkjsdev/spark');
      loading.signal.throwIfAborted();

      const splats = new SplatMesh({ fileBytes, fileType: SplatFileType.SPZ, raycastable: false, editable: false });
      staged = { splats };
      await splats.initialized;
      loading.signal.throwIfAborted();

      const staging = new scene.constructor();
      const group = new Group();
      staged.group = group;
      group.name = 'Marble 写实环境';
      group.add(splats);
      staging.add(group);
      splats.position.fromArray(marble.position);
      splats.rotation.set(marble.axes === 'opencv' ? Math.PI : 0, marble.yawDegrees * Math.PI / 180, 0, 'YXZ');
      splats.scale.setScalar(marble.scale);
      staging.updateMatrixWorld(true);

      // Prepare the first sorted splats before changing the live scene.
      const spark = new SparkRenderer({ renderer, depthTest: true, depthWrite: false });
      staged.spark = spark;
      renderer.getDrawingBufferSize(spark.renderSize);
      await spark.update({ scene: staging, camera });
      loading.signal.throwIfAborted();
      if (!spark.activeSplats) throw new Error('SPZ 没有可渲染的点云');
      // Finish adding legacy garden meshes before assigning their pick-only layers.
      await prepareLegacy();
      loading.signal.throwIfAborted();
      spark.raycast = () => {};
      group.add(spark);
      // Transfer the prepared objects to the game scene without changing their world transform.
      scene.add(group);
      hideEnvironment(roots, originalLayers);
      active = staged;
      staged = undefined;
      refresh();
      showStatus('marble', '当前显示 Marble 写实环境（测试）。');
    } catch (error) {
      if (loading.signal.aborted) return;
      stopMarble();
      control.value = 'original';
      showStatus('error', '写实环境加载失败，已恢复原场景。');
      console.warn('Marble 环境加载失败', error);
    } finally {
      staged?.group?.removeFromParent();
      staged?.spark?.dispose();
      staged?.splats.dispose();
      if (pending === loading) pending = undefined;
    }
  }

  control.addEventListener('change', () => {
    if (control.value === 'marble') {
      if (!pending && !active) void startMarble();
    } else {
      stopMarble();
      showStatus('original', '当前显示原场景。');
    }
  }, { signal });
  signal.addEventListener('abort', stopMarble, { once: true });
  control.disabled = false;
  showStatus('original', '当前显示原场景。');
  if (new URLSearchParams(location.search).get('environment') === 'marble') {
    control.value = 'marble';
    void startMarble();
  }
}
