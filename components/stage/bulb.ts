// The lit LED bulb that hangs over the range, built in code from the live site's bulb (components/home/bulbScene.ts):
// a G-type clear globe turned on a lathe, six LED filaments on a glass stem, an E27 brass base, here on a black pendant
// holder and cord. The filaments glow in the colour temperature the Lighting slider sets; a soft halo and a small warm
// light inside let it light what stands near it. About 20 cm across, a statement globe.

import * as THREE from 'three';
import { kelvinToRgb } from '@/lib/kelvin';

/** Clear glass on a dark stage: no colour of its own, a fresnel edge and two studio highlights. */
function glassMaterial(strength: number, side: THREE.Side) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side,
    uniforms: { tint: { value: new THREE.Color(0.75, 0.72, 0.66) }, strength: { value: strength } },
    vertexShader: `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 tint;
      uniform float strength;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec3 n = normalize(vN);
        if (!gl_FrontFacing) n = -n;
        float edge = 1.0 - abs(dot(n, vV));
        vec3 r = reflect(-vV, n);
        float key = pow(max(dot(r, normalize(vec3(0.45, 0.6, 0.66))), 0.0), 60.0) * 0.9;
        float soft = pow(max(dot(r, normalize(vec3(-0.6, 0.3, 0.72))), 0.0), 16.0) * 0.18;
        float s = clamp(key + soft, 0.0, 1.0);
        float a = pow(edge, 2.6) * 0.42 + 0.015;
        vec3 col = mix(tint, vec3(1.0), s / max(a + s, 0.001));
        gl_FragColor = vec4(col, clamp((a + s) * strength, 0.0, 1.0));
        #include <colorspace_fragment>
      }`,
  });
}

function softDot() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export interface Bulb {
  /** Origin at the centre of the globe; the cord runs up out of the picture. */
  group: THREE.Group;
  setKelvin: (k: number) => void;
  dispose: () => void;
}

export function createBulb(kelvin = 2900): Bulb {
  const group = new THREE.Group();
  group.name = 'bulb';
  const bulb = new THREE.Group();
  // Built at a radius of 1 (as on the live site), then scaled to a 20 cm globe.
  bulb.scale.setScalar(0.1);
  group.add(bulb);

  const globe: THREE.Vector2[] = [];
  const meet = -0.97;
  for (let i = 0; i <= 48; i++) {
    const a = Math.PI / 2 + (i / 48) * (meet - Math.PI / 2);
    globe.push(new THREE.Vector2(Math.max(0.0001, Math.cos(a)), Math.sin(a)));
  }
  const neck = new THREE.QuadraticBezierCurve(new THREE.Vector2(Math.cos(meet), Math.sin(meet)), new THREE.Vector2(0.3, -1.08), new THREE.Vector2(0.3, -1.42));
  globe.push(...neck.getPoints(16).slice(1));
  // The bulb hangs base up, so each lathe profile is flipped (and reversed, which keeps its faces pointing outward).
  const flip = (p: THREE.Vector2) => new THREE.Vector2(p.x, -p.y);
  const glassGeo = new THREE.LatheGeometry(globe.map(flip).reverse(), 96);
  const glassBack = new THREE.Mesh(glassGeo, glassMaterial(0.5, THREE.BackSide));
  const glassFront = new THREE.Mesh(glassGeo, glassMaterial(1, THREE.FrontSide));
  glassBack.renderOrder = 3;
  glassFront.renderOrder = 5;
  bulb.add(glassBack, glassFront);

  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a35b, metalness: 1, roughness: 0.3 });
  const thread: THREE.Vector2[] = [new THREE.Vector2(0.3, -1.4), new THREE.Vector2(0.312, -1.42), new THREE.Vector2(0.312, -1.52)];
  for (let i = 0; i <= 80; i++) {
    const y = -1.52 - (i / 80) * 0.56;
    thread.push(new THREE.Vector2(0.282 + 0.02 * Math.sin((i / 80) * Math.PI * 2 * 5.5), y));
  }
  thread.push(new THREE.Vector2(0.24, -2.1), new THREE.Vector2(0.0001, -2.1));
  bulb.add(new THREE.Mesh(new THREE.LatheGeometry(thread.map(flip).reverse(), 72), brass));

  // The pendant holder over the base, and the cord.
  const black = new THREE.MeshStandardMaterial({ color: 0x0b0c0c, roughness: 0.35, metalness: 0.2 });
  const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 1.1, 48), black);
  holder.position.y = 2.55;
  bulb.add(holder);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 60, 12), black);
  cord.position.y = 3.1 + 30;
  bulb.add(cord);

  const stem = new THREE.Mesh(
    new THREE.LatheGeometry(
      [new THREE.Vector2(0.22, -1.38), new THREE.Vector2(0.1, -1.18), new THREE.Vector2(0.06, -0.9), new THREE.Vector2(0.05, -0.72), new THREE.Vector2(0.0001, -0.7)].map(flip).reverse(),
      32,
    ),
    glassMaterial(0.7, THREE.DoubleSide),
  );
  stem.renderOrder = 4;
  bulb.add(stem);

  const filament = new THREE.MeshBasicMaterial({ toneMapped: false });
  const wire = new THREE.MeshStandardMaterial({ color: 0xb9b9b9, metalness: 0.9, roughness: 0.35 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const low = new THREE.Vector3(Math.cos(a) * 0.17, 0.6, Math.sin(a) * 0.17);
    const high = new THREE.Vector3(Math.cos(a) * 0.1, -0.36, Math.sin(a) * 0.1);
    const mid = low.clone().lerp(high, 0.5).add(new THREE.Vector3(Math.cos(a) * 0.035, 0, Math.sin(a) * 0.035));
    bulb.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(low, mid, high), 24, 0.024, 8), filament));
    bulb.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, -0.36, 0), high), 1, 0.005, 6), wire));
  }

  const dot = softDot();
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.55, toneMapped: false }));
  halo.scale.set(0.55, 0.55, 1);
  halo.renderOrder = 6;
  group.add(halo);
  const glow = new THREE.PointLight(0xffffff, 0.9, 3.5, 2);
  group.add(glow);

  const lit = new THREE.Color();
  const setKelvin = (k: number) => {
    const [r, g, b] = kelvinToRgb(k);
    lit.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    filament.color.copy(lit).lerp(new THREE.Color(1, 1, 1), 0.3).multiplyScalar(1.6);
    halo.material.color.copy(lit);
    glow.color.copy(lit);
  };
  setKelvin(kelvin);

  return {
    group,
    setKelvin,
    dispose: () => {
      group.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Sprite) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m: THREE.Material & { map?: THREE.Texture | null }) => {
            m.map?.dispose();
            m.dispose();
          });
        }
      });
    },
  };
}
