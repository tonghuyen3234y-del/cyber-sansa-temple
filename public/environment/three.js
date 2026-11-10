// Spark must use the same Three.js objects, IDs and shader chunks as the game.
// Supply the few classes that the game bundle's tree shaking omitted from r180.
export * from '/assets/game-B7kPresence.js?v=20261106marble1';
export { CubeCamera } from '/node_modules/three/src/cameras/CubeCamera.js';
export { InstancedBufferGeometry } from '/node_modules/three/src/core/InstancedBufferGeometry.js';
export { Timer } from '/node_modules/three/src/core/Timer.js';
export { Matrix2 } from '/node_modules/three/src/math/Matrix2.js';
export { WebGLArrayRenderTarget } from '/node_modules/three/src/renderers/WebGLArrayRenderTarget.js';
