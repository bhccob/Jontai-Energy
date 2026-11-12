// Turns the Blender exports in tools/blender/products/out into what the site serves:
//   public/models/showroom.v1.glb  every product under its own named root, Meshopt-compressed, WebP textures
//   public/stage/shadow-<name>.webp  each product's contact shadow, faded to nothing at its edges
// Run from the repo root after exporting from Blender: node tools/blender/products/publish.mjs

import { mkdir, readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { dedup, join as joinPrimitives, meshopt, mergeDocuments, prune, unpartition, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

// gltf-transform/functions already loads its own sharp (through ndarray-pixels). Two copies of libvips in one process
// break each other, so this script uses that same copy rather than the repo's pinned one.
const fromFunctions = createRequire(fileURLToPath(import.meta.resolve('@gltf-transform/functions')));
const sharp = createRequire(fromFunctions.resolve('ndarray-pixels'))('sharp');

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const out = join(here, 'out');
const VERSION = 'v1';

/** The products in the stage, in the order the page meets them. Missing exports are skipped with a note. */
const PRODUCTS = ['inverter', 'solar_panel', 'power_station', 'ac_indoor', 'ac_outdoor', 'site_camera', 'lounge_chair', 'loyalty_card'];

/** Textures that carry fine print keep more pixels (the big panel's busbars vanish at 1024). */
const maxSize = (name) => (/panel-cells/.test(name) ? 2048 : 1024);

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
});

const exists = async (p) => !!(await stat(p).catch(() => null));

// One document, one scene, one buffer: each product's root node sits at the top of the scene.
const doc = await io.read(join(out, `${PRODUCTS[0]}.glb`));
for (const name of PRODUCTS.slice(1)) {
  const file = join(out, `${name}.glb`);
  if (!(await exists(file))) {
    console.warn('skipped (no export yet):', name);
    continue;
  }
  mergeDocuments(doc, await io.read(file));
}
const [scene, ...rest] = doc.getRoot().listScenes();
for (const s of rest) {
  for (const n of s.listChildren()) scene.addChild(n);
  s.dispose();
}
doc.getRoot().setDefaultScene(scene);

// Fewer draw calls: every part of a product moves up to sit directly under the product's root (keeping where it is),
// then parts that share a material are joined into one mesh. The roots stay separate, so each product still moves on
// its own in the stage.
const mul = (a, b) => {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
};
const invertAffine = (m) => {
  // Rotation-scale block inverse by cofactors, then the translation.
  const [a, b, c, , d, e, f, , g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  const inv = [
    A / det, -(b * i - c * h) / det, (b * f - c * e) / det, 0,
    B / det, (a * i - c * g) / det, -(a * f - c * d) / det, 0,
    C / det, -(a * h - b * g) / det, (a * e - b * d) / det, 0,
    0, 0, 0, 1,
  ];
  const t = [m[12], m[13], m[14]];
  for (let r = 0; r < 3; r++) inv[12 + r] = -(inv[r] * t[0] + inv[4 + r] * t[1] + inv[8 + r] * t[2]);
  return inv;
};
for (const productRoot of scene.listChildren()) {
  const toRoot = invertAffine(productRoot.getWorldMatrix());
  const meshes = [];
  productRoot.traverse((n) => {
    if (n !== productRoot && n.getMesh()) meshes.push([n, mul(toRoot, n.getWorldMatrix())]);
  });
  for (const [n, local] of meshes) {
    productRoot.addChild(n);
    n.setMatrix(local);
  }
}

await doc.transform(unpartition(), dedup(), prune(), weld(), joinPrimitives({ keepNamed: false }), prune());

// Textures to WebP, at most 1024 px.
doc.createExtension(EXTTextureWebP).setRequired(true);
for (const tex of doc.getRoot().listTextures()) {
  const image = tex.getImage();
  if (!image) continue;
  const max = maxSize(`${tex.getName()} ${tex.getURI()}`);
  const webp = await sharp(Buffer.from(image)).resize(max, max, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
  tex.setImage(new Uint8Array(webp)).setMimeType('image/webp');
  tex.setURI(tex.getURI().replace(/\.png$/i, '.webp'));
}

await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));

await mkdir(join(root, 'public', 'models'), { recursive: true });
const glb = join(root, 'public', 'models', `showroom.${VERSION}.glb`);
await io.write(glb, doc);
console.log('wrote', glb, `${Math.round((await stat(glb)).size / 1024)} KB`);

// Contact shadows: black, the alpha carries the shadow; the edges fade to zero so no rectangle shows on the floor.
await mkdir(join(root, 'public', 'stage'), { recursive: true });
for (const name of PRODUCTS) {
  const file = join(out, `${name}-shadow.png`);
  if (!(await exists(file))) continue;
  const { data, info } = await sharp(await readFile(file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const edge = 0.14;
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const fx = Math.min(x / (w - 1), 1 - x / (w - 1)) / edge;
      const fy = Math.min(y / (h - 1), 1 - y / (h - 1)) / edge;
      data[i] = data[i + 1] = data[i + 2] = 0;
      data[i + 3] = Math.round(data[i + 3] * smooth(fx) * smooth(fy));
    }
  }
  const target = join(root, 'public', 'stage', `shadow-${name}.webp`);
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 90, alphaQuality: 100 }).toFile(target);
  console.log('wrote', target);
}
