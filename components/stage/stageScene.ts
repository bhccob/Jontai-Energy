// The after-hours stage: one WebGL canvas behind the home page's first sections. It loads the Blender products
// (models.ts), lights them (studio.ts), hangs the lit bulb (bulb.ts), and every frame moves the camera, the key light
// and each product a little closer to the shot for the current scroll position (lib/shots.ts, lib/stage.ts). Pointing
// at a range in the first view moves the key light onto that product.
//
// House rules (as the live site's bulb): three.js arrives in this lazy chunk only; frames are drawn on GSAP's ticker
// (after Lenis), and only while something moves, the stage is on screen, uncovered, the tab visible and no menu or panel
// holds the page; a lost WebGL context hands back to the still picture.

import * as THREE from 'three';
import { gsap } from 'gsap';
import { kelvin } from '@/components/home/kelvinBus';
import { KEYS as PAGE_KEYS, PRODUCTS, RANGES, SHADOWS, type ProductId } from '@/lib/shots';
import { approachShot, damp, sample, shotGap, type Keyframe, type Shot } from '@/lib/stage';
import { createBulb } from './bulb';
import { disposeObject, loadShowroom } from './models';
import { stageBus } from './stageBus';
import { contactShadow, createRenderer, createStudio } from './studio';

export interface StageHooks {
  /** The first frame is on screen. */
  onReady: () => void;
  /** The WebGL context is gone; the still picture should come back. */
  onLost: () => void;
}

/** Horizontal coverage is kept as on a 16:10 screen, so narrower screens see the same products. */
const REF_ASPECT = 1.6;
/** How quickly the stage follows the scroll (see damp in lib/stage.ts). */
const FOLLOW = 4.2;
/** Seconds without input after which the slow drift fades away and the stage can rest. */
const IDLE = 10;

export interface StageOptions {
  /** Other shots than the page's (the lab uses this to frame the phone still). */
  keys?: Keyframe[];
  /** The screen shape whose width the shots are composed for (see REF_ASPECT). */
  refAspect?: number;
  /** No slow drift or pointer lean: a still, for the picture painted before the live stage. */
  still?: boolean;
}

export async function createStage(host: HTMLElement, hooks: StageHooks, options: StageOptions = {}): Promise<() => void> {
  const KEYS = options.keys ?? PAGE_KEYS;
  const refAspect = options.refAspect ?? REF_ASPECT;
  const renderer = createRenderer();
  const canvas = renderer.domElement;
  canvas.className = 'stage__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const studio = createStudio(renderer);
  const { scene, key, pool } = studio;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);

  const showroom = await loadShowroom();
  const bulb = createBulb(kelvin.get());
  const items = new Map<ProductId, THREE.Object3D>();
  for (const id of PRODUCTS) {
    const ob = id === 'bulb' ? bulb.group : showroom.get(id);
    if (!ob) continue;
    scene.add(ob);
    items.set(id, ob);
  }
  const loader = new THREE.TextureLoader();
  await Promise.all(
    Object.entries(SHADOWS).map(async ([id, size]) => {
      const ob = items.get(id as ProductId);
      if (!ob || !size) return;
      ob.add(contactShadow(await loader.loadAsync(`/stage/shadow-${id}.webp`), size[0], size[1]));
    }),
  );

  // ------------------------------------------------------------ state

  let width = 0;
  let height = 0;
  let shot: Shot = sample(KEYS, stageBus.get().beat);
  const spotLight = new THREE.Vector3(...shot.light);
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let lastInput = options.still ? -1e9 : performance.now();
  let drift = options.still ? 0 : 1;
  let frame = 0;
  let ready = false;
  let lost = false;
  let onScreen = true;
  let held = document.documentElement.classList.contains('lenis-stopped');
  let slowFrames = 0;
  let dprCap = 2;
  let dirty = true;

  const target = () => sample(KEYS, stageBus.get().beat);
  const spotTarget = (): [number, number, number] => {
    const spot = stageBus.get().spot;
    const range = spot ? RANGES.find((r) => r.id === spot) : undefined;
    return range && stageBus.get().beat < 0.5 ? range.light : target().light;
  };

  const apply = (time: number) => {
    const c = shot.camera;
    const sway = drift * 0.06;
    camera.position.set(
      c.at[0] + pointer.x * 0.14 + Math.sin(time * 0.13) * sway,
      c.at[1] + pointer.y * 0.06 + Math.sin(time * 0.09) * sway * 0.4,
      c.at[2],
    );
    camera.lookAt(c.look[0], c.look[1], c.look[2]);
    const aspect = width / Math.max(height, 1);
    const half = Math.tan(THREE.MathUtils.degToRad(c.fov) / 2) * Math.max(1, refAspect / aspect);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(half));
    camera.aspect = aspect;
    camera.setViewOffset(width, height, -c.shift * width, 0, width, height);
    camera.updateProjectionMatrix();
    for (const [id, ob] of items) {
      const p = shot.products[id];
      if (!p) continue;
      const s = p.scale ?? 1;
      ob.visible = s > 0.01;
      ob.position.set(p.at[0], p.at[1], p.at[2]);
      ob.rotation.y = p.yaw;
      ob.scale.setScalar(Math.max(s, 0.0001));
    }
    key.target.position.copy(spotLight);
    pool.position.set(shot.light[0], 0, shot.light[2]);
    pool.scale.setScalar(1.9);
  };

  // ------------------------------------------------------------ size

  const size = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w < 40 || h < 40) return;
    width = w;
    height = h;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap, Math.sqrt(5e6 / (w * h)));
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    dirty = true;
    wake();
  };

  // ------------------------------------------------------------ the loop

  const visible = () => onScreen && !held && !lost && !stageBus.get().covered && !document.hidden && width > 0;
  const aim = new THREE.Vector3();
  let running = false;

  const tick = (time: number, deltaMs: number) => {
    if (!visible()) {
      running = false;
      gsap.ticker.remove(tick);
      return;
    }
    const dt = Math.min(0.05, (deltaMs || 16.7) / 1000);
    const now = performance.now();
    drift = damp(drift, now - lastInput < IDLE * 1000 ? 1 : 0, 0.8, dt);
    const next = approachShot(shot, target(), FOLLOW, dt);
    const gap = shotGap(next, target());
    shot = next;
    aim.set(...spotTarget());
    spotLight.set(damp(spotLight.x, aim.x, 3, dt), damp(spotLight.y, aim.y, 3, dt), damp(spotLight.z, aim.z, 3, dt));
    pointer.x = damp(pointer.x, pointer.tx, 3, dt);
    pointer.y = damp(pointer.y, pointer.ty, 3, dt);
    const settled =
      gap < 1e-4 &&
      drift < 0.002 &&
      Math.abs(pointer.x - pointer.tx) < 1e-3 &&
      Math.abs(pointer.y - pointer.ty) < 1e-3 &&
      spotLight.distanceTo(aim) < 1e-3;
    apply(time);
    renderer.render(scene, camera);
    dirty = false;
    if (!ready) {
      ready = true;
      hooks.onReady();
    }
    // A slow machine draws at a lower pixel ratio, once.
    if (deltaMs > 24) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 45 && dprCap > 1) {
      dprCap = 1;
      size();
    }
    if (settled && !dirty) {
      running = false;
      gsap.ticker.remove(tick);
    }
  };

  function wake() {
    if (running || !visible()) return;
    running = true;
    gsap.ticker.add(tick);
  }

  // ------------------------------------------------------------ inputs

  const offBus = stageBus.on(() => {
    lastInput = performance.now();
    wake();
  });
  const offKelvin = kelvin.on((k) => {
    bulb.setKelvin(k);
    dirty = true;
    wake();
  });
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || options.still) return;
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    lastInput = performance.now();
    wake();
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  const onVisibility = () => wake();
  document.addEventListener('visibilitychange', onVisibility);

  const resized = new ResizeObserver(size);
  resized.observe(host);
  // The stage is clipped to its scope (stage.css), so what counts is whether the scope is on screen.
  const seen = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    wake();
  });
  seen.observe(host.parentElement ?? host);
  const holds = new MutationObserver(() => {
    held = document.documentElement.classList.contains('lenis-stopped');
    wake();
  });
  holds.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const contextLost = (e: Event) => {
    e.preventDefault();
    lost = true;
    hooks.onLost();
  };
  canvas.addEventListener('webglcontextlost', contextLost);

  // ------------------------------------------------------------ first frame

  host.appendChild(canvas);
  size();
  apply(0);
  await renderer.compileAsync(scene, camera);
  wake();

  if (process.env.NODE_ENV === 'development') {
    (window as unknown as { __stage?: unknown }).__stage = { renderer, scene, camera, items, stageBus };
  }

  return () => {
    gsap.ticker.remove(tick);
    offBus();
    offKelvin();
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    resized.disconnect();
    seen.disconnect();
    holds.disconnect();
    canvas.removeEventListener('webglcontextlost', contextLost);
    showroom.forEach((ob) => disposeObject(ob));
    bulb.dispose();
    studio.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
