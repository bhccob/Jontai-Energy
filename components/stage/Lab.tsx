'use client';

import { useEffect, useRef } from 'react';

/**
 * Development only (/lab): one product on the after-hours stage, to judge a Blender model in the web renderer before
 * it goes into the page. `?view=cycles` (default) frames it like the Cycles still in tools/blender/products/out, so
 * the two can be compared side by side; `?view=hero` frames it large on the right of a wide screen. Drag to turn.
 */
export function Lab() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gone = false;
    let teardown = () => {};
    (async () => {
      const THREE = await import('three');
      const { createRenderer, createStudio, contactShadow } = await import('./studio');
      const { loadShowroom, disposeObject } = await import('./models');
      const el = host.current;
      if (gone || !el) return;

      const params = new URLSearchParams(location.search);
      const name = params.get('product') ?? 'inverter';
      const view = params.get('view') ?? 'cycles';

      // ?view=stage&beat=0: the real stage (stageScene) at a fixed point along the page, for composing shots.
      if (view === 'stage') {
        const { createStage } = await import('./stageScene');
        const { stageBus } = await import('./stageBus');
        const { HERO_PHONE } = await import('@/lib/shots');
        stageBus.setBeat(Number(params.get('beat') ?? 0));
        if (params.get('spot')) stageBus.setSpot(params.get('spot'));
        el.dataset.live = 'false';
        // &frame=phone: the phone still's framing; &still: no drift or pointer lean (for the pictures painted first).
        const phone = params.get('frame') === 'phone';
        const stop = await createStage(
          el,
          {
            onReady: () => {
              el.dataset.live = 'true';
              (window as unknown as { __labReady?: boolean }).__labReady = true;
            },
            onLost: () => {},
          },
          { keys: phone ? [{ at: 0, shot: HERO_PHONE }] : undefined, refAspect: phone ? 0.9 : undefined, still: params.has('still') },
        );
        if (gone) stop();
        else teardown = stop;
        return;
      }

      const renderer = createRenderer();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      el.appendChild(renderer.domElement);
      const studio = createStudio(renderer);
      const products = await loadShowroom();
      const product = products.get(name);
      if (gone || !product) return;
      studio.scene.add(product);
      const shadow = contactShadow(await new THREE.TextureLoader().loadAsync(`/stage/shadow-${name}.webp`), 0.9, 0.6);
      product.add(shadow);

      // The Cycles still's camera (stage.py frame(): 85 mm, 30 degrees left, 8 degrees up, 2.4 m), in Y up.
      const box = new THREE.Box3().setFromObject(product);
      const centre = (box.min.y + box.max.y) / 2;
      const hfov = 2 * Math.atan(18 / 85);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40);
      const az = THREE.MathUtils.degToRad(view === 'hero' ? -24 : -30);
      const el8 = THREE.MathUtils.degToRad(8);
      const dist = view === 'hero' ? 1.9 : 2.4;
      camera.position.set(dist * Math.sin(az) * Math.cos(el8), centre + dist * Math.sin(el8), dist * Math.cos(az) * Math.cos(el8));
      camera.lookAt(0, centre, 0);

      let yaw = 0;
      let dragging = false;
      let lastX = 0;
      const down = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        yaw += ((e.clientX - lastX) / el.clientWidth) * Math.PI * 1.6;
        lastX = e.clientX;
      };
      const up = () => (dragging = false);
      el.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);

      const size = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hfov / 2) / Math.min(camera.aspect, 1)));
        // On a wide screen the product sits right of centre, where the hero will put it.
        if (view === 'hero') camera.setViewOffset(w, h, -w * 0.18, 0, w, h);
        camera.updateProjectionMatrix();
      };
      size();
      const resized = new ResizeObserver(size);
      resized.observe(el);

      let frame = 0;
      const tick = () => {
        product.rotation.y = yaw;
        renderer.render(studio.scene, camera);
        (window as unknown as { __labReady?: boolean }).__labReady = true;
        frame = requestAnimationFrame(tick);
      };
      tick();

      teardown = () => {
        cancelAnimationFrame(frame);
        resized.disconnect();
        el.removeEventListener('pointerdown', down);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        products.forEach((p) => disposeObject(p));
        studio.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    })();
    return () => {
      gone = true;
      teardown();
    };
  }, []);

  return <div ref={host} className="stage" style={{ position: 'fixed', inset: 0, zIndex: 1000, height: '100vh', margin: 0, background: '#0f281d', touchAction: 'none' }} />;
}
