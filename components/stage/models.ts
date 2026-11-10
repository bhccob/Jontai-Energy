// Loads the showroom: one Meshopt-compressed GLB (tools/blender/products/publish.mjs) with a named root per product.
// The Meshopt decoder is small and is bundled into this lazy chunk, so nothing is fetched from elsewhere.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export const SHOWROOM_URL = '/models/showroom.v1.glb';

/** The product roots by name ("inverter", ...), each with its origin at the centre of its base. */
export async function loadShowroom(url = SHOWROOM_URL): Promise<Map<string, THREE.Object3D>> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const products = new Map<string, THREE.Object3D>();
  for (const child of [...gltf.scene.children]) {
    // Each root sits on the floor where Blender put it; the stage places it, so wrap it in a group at the origin.
    const holder = new THREE.Group();
    holder.name = child.name;
    holder.add(child);
    products.set(child.name, holder);
  }
  return products;
}

/** Frees a product's geometry, materials and textures. */
export function disposeObject(root: THREE.Object3D) {
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats as (THREE.MeshStandardMaterial & Record<string, unknown>)[]) {
      for (const key of ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'alphaMap']) {
        (m[key] as THREE.Texture | null | undefined)?.dispose();
      }
      m.dispose();
    }
  });
}
