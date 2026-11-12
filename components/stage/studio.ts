// The after-hours showroom for three.js, matched to the Cycles stills (tools/blender/products/stage.py).
//
// Light: a warm key spotlight above front-right (its falloff gives the white faces a gradient, as Blender's area light
// does), a mint rim from behind on the left, and a deep-forest room as the environment map, with softbox panels in it
// so glossy parts (glass, gloss rims, steel) reflect real studio shapes. No HDR download: the room is built here.
// Ground: there is no floor plane, so there is no horizon line; the canvas clears to the page colour and a pool of
// light fades out under the products, with each product's contact shadow (baked in Blender) on it.

import * as THREE from 'three';

/** The page's deep forest, #0f281d. The canvas clears to it, so the stage has no edge against the page. */
export const DEEP = 0x0f281d;

/** Blender works in Z up, three.js in Y up: (x, y, z) in Blender is (x, z, -y) here. */
export const fromBlender = (x: number, y: number, z: number) => new THREE.Vector3(x, z, -y);

const KEY_DIR = fromBlender(0.9, -2.2, 1.9).normalize();
const RIM_DIR = fromBlender(-1.0, 1.0, 1.1).normalize();

/** A light-emitting panel facing the origin, for the environment room. */
function softbox(color: THREE.ColorRepresentation, strength: number, w: number, h: number, at: THREE.Vector3) {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  panel.position.copy(at);
  panel.lookAt(0, 0, 0);
  return panel;
}

/** The room the environment map is taken from: dim forest walls, a darker floor, three softboxes. */
function room() {
  const scene = new THREE.Scene();
  scene.add(
    new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(DEEP).multiplyScalar(1.4), side: THREE.BackSide })),
  );
  const ground = new THREE.Mesh(new THREE.CircleGeometry(9.5, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(DEEP).multiplyScalar(0.7) }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  scene.add(ground);
  scene.add(softbox(0xfff0dc, 26, 3.2, 2.2, KEY_DIR.clone().multiplyScalar(6)));
  scene.add(softbox(0xb3f2c6, 10, 1.0, 4.0, RIM_DIR.clone().multiplyScalar(6)));
  scene.add(softbox(0xe0ecff, 2.4, 4.0, 2.4, fromBlender(-2.0, -1.4, 0.5).normalize().multiplyScalar(6)));
  return scene;
}

export function createRenderer(canvas?: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(DEEP, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Neutral keeps appliance whites white and the brand greens true (ACES would shift both); Blender renders with the
  // same curve (Khronos PBR Neutral).
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  return renderer;
}

/** The pool's shape as an alpha map (three reads alpha maps from the green channel): white in the middle, black out. */
function radial() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, 256, 256);
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, '#fff');
  r.addColorStop(0.3, '#a8a8a8');
  r.addColorStop(0.62, '#383838');
  r.addColorStop(1, '#000');
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export interface Studio {
  scene: THREE.Scene;
  /** The warm key; move its target to light one product. */
  key: THREE.SpotLight;
  rim: THREE.DirectionalLight;
  /** The pool of light on the ground; move and scale it with the products. */
  pool: THREE.Mesh;
  dispose: () => void;
}

export function createStudio(renderer: THREE.WebGLRenderer): Studio {
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomScene = room();
  const env = pmrem.fromScene(roomScene, 0.03).texture;
  roomScene.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  scene.environment = env;
  scene.environmentIntensity = 0.45;

  const key = new THREE.SpotLight(0xfffaf5, 34, 0, 0.42, 1, 2);
  key.position.copy(KEY_DIR).multiplyScalar(3.2);
  key.target.position.set(0, 0.3, 0);
  scene.add(key, key.target);

  const rim = new THREE.DirectionalLight(0xcdf3dc, 0.9);
  rim.position.copy(RIM_DIR).multiplyScalar(3);
  rim.target.position.set(0, 0.3, 0);
  scene.add(rim, rim.target);

  const poolMap = radial();
  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.6),
    new THREE.MeshBasicMaterial({ color: 0x24533d, alphaMap: poolMap, transparent: true, depthWrite: false, toneMapped: false }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.renderOrder = 0;
  scene.add(pool);

  return {
    scene,
    key,
    rim,
    pool,
    dispose: () => {
      env.dispose();
      pmrem.dispose();
      poolMap.dispose();
      pool.geometry.dispose();
      (pool.material as THREE.Material).dispose();
    },
  };
}

/** A product's contact shadow (public/stage/shadow-<name>.webp: black, the shadow in its alpha), under its base. */
export function contactShadow(texture: THREE.Texture, width: number, depth: number, strength = 0.9) {
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: strength, depthWrite: false, toneMapped: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.001;
  mesh.renderOrder = 1;
  return mesh;
}
