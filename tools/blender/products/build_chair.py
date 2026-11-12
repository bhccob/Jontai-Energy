"""The oak lounge chair, after public/catalog/lounge-chair.webp: a solid oak frame (tapered round legs, side and cross
rails, flat armrests, raked back posts) with sage boucle seat and back cushions. 0.68 x 0.74 x 0.80 m.
The boucle relief and the oak grain are small tiling textures made here with numpy (textures/boucle-normal.png,
textures/oak-base.png), so the fabric and the wood never read as plastic. Run inside Blender: exec(open(<this file>).read()).
"""

import importlib
import math
import sys

import bpy
import numpy as np

HERE = r"C:\Users\bhcco\Documents\Jontai-Energy\.claude\worktrees\v9\tools\blender\products"
if HERE not in sys.path:
    sys.path.insert(0, HERE)
import common  # noqa: E402

importlib.reload(common)
from common import TEXTURES, bevel, box_uv, empty, fresh_collection, prism, prism_x, rod, rounded_rect  # noqa: E402

rng = np.random.default_rng(73)


def periodic_blur(img, sy, sx):
    """Gaussian blur that wraps round the edges (so the texture tiles), done in the frequency domain."""
    h, w = img.shape
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    k = np.exp(-2 * (math.pi ** 2) * ((fy * sy) ** 2 + (fx * sx) ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(img) * k))


def save(name, rgb):
    """rgb: float array (h, w, 3) in 0..1, written as an 8-bit PNG (top row first)."""
    h, w, _ = rgb.shape
    img = bpy.data.images.get(name) or bpy.data.images.new(name, w, h, alpha=False)
    if img.size[0] != w:
        img.scale(w, h)
    px = np.ones((h, w, 4), dtype=np.float32)
    px[..., :3] = np.clip(rgb, 0, 1)
    img.pixels.foreach_set(px[::-1].ravel())
    img.filepath_raw = TEXTURES + "\\" + name
    img.file_format = "PNG"
    img.save()
    return img


# Boucle: tight loops of yarn, as a height field of small blobs, turned into a tangent-space normal map.
N = 512
loops = periodic_blur(rng.random((N, N)), 2.2, 2.2)
loops = (loops - loops.mean()) / loops.std()
lumps = periodic_blur(rng.random((N, N)), 7, 7)
height = loops + 0.6 * (lumps - lumps.mean()) / lumps.std()
gy = (np.roll(height, -1, 0) - np.roll(height, 1, 0)) * 0.5
gx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) * 0.5
strength = 0.9
n = np.dstack((-gx * strength, gy * strength, np.ones_like(height)))
n /= np.linalg.norm(n, axis=2, keepdims=True)
save("boucle-normal.png", n * 0.5 + 0.5)

# Oak: fine grain running along v, with a few wider figure bands, in honey tones.
grain = periodic_blur(rng.random((N, N)), 26, 0.9)
grain = (grain - grain.mean()) / grain.std()
bands = periodic_blur(rng.random((N, N)), 80, 6)
bands = (bands - bands.mean()) / bands.std()
t = np.clip(0.5 + 0.11 * grain + 0.07 * bands, 0, 1)[..., None]
light = np.array([0.80, 0.60, 0.38])
dark = np.array([0.62, 0.43, 0.24])
save("oak-base.png", dark + (light - dark) * t)

# ---------------------------------------------------------------- materials


def fabric_material():
    m = bpy.data.materials.get("je_boucle") or bpy.data.materials.new("je_boucle")
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes.get("Principled BSDF")
    for node in [x for x in nt.nodes if x.type in ("TEX_IMAGE", "NORMAL_MAP")]:
        nt.nodes.remove(node)
    p.inputs["Base Color"].default_value = (0.25, 0.33, 0.24, 1)
    p.inputs["Roughness"].default_value = 0.96
    p.inputs["Sheen Weight"].default_value = 0.6
    p.inputs["Sheen Roughness"].default_value = 0.6
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(TEXTURES + r"\boucle-normal.png", check_existing=True)
    tex.image.colorspace_settings.name = "Non-Color"
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 1.0
    nt.links.new(tex.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], p.inputs["Normal"])
    return m


def oak_material():
    m = bpy.data.materials.get("je_oak") or bpy.data.materials.new("je_oak")
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes.get("Principled BSDF")
    for node in [x for x in nt.nodes if x.type == "TEX_IMAGE"]:
        nt.nodes.remove(node)
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(TEXTURES + r"\oak-base.png", check_existing=True)
    nt.links.new(tex.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.42
    p.inputs["Coat Weight"].default_value = 0.15
    return m


boucle = fabric_material()
oak = oak_material()

# ---------------------------------------------------------------- the chair

col = fresh_collection("lounge_chair")
root = empty("lounge_chair", col)
parts = []
SX = 0.295  # half the frame's width
RAIL = 0.30  # seat rail height

for s in (-1, 1):
    x = s * SX
    parts.append(rod("chair_leg_front", (x, -0.30, 0.0), (x, -0.275, 0.605), 0.015, col, oak, sides=20, r_end=0.022))
    parts.append(rod("chair_leg_back", (x, 0.375, 0.0), (x, 0.215, RAIL + 0.01), 0.015, col, oak, sides=20, r_end=0.021))
    parts.append(rod("chair_post", (x, 0.205, RAIL), (x, 0.375, 0.79), 0.021, col, oak, sides=20, r_end=0.016))
    parts.append(bevel(prism("chair_rail_side", rounded_rect(0.03, 0.05, 0.008, cx=x, cz=RAIL), -0.29, 0.235, col, [oak]), 0.004, segments=3))
    arm = prism("chair_arm", rounded_rect(0.058, 0.026, 0.012, cx=s * (SX + 0.008), cz=0.617), -0.335, 0.29, col, [oak])
    parts.append(bevel(arm, 0.012, segments=5))
parts.append(bevel(prism_x("chair_rail_front", rounded_rect(0.03, 0.05, 0.008, cx=-0.272, cz=RAIL), -SX, SX, col, [oak]), 0.004, segments=3))
parts.append(bevel(prism_x("chair_rail_back", rounded_rect(0.03, 0.045, 0.008, cx=0.22, cz=RAIL), -SX, SX, col, [oak]), 0.004, segments=3))
parts.append(bevel(prism_x("chair_rail_top", rounded_rect(0.03, 0.04, 0.008, cx=0.36, cz=0.745), -SX, SX, col, [oak]), 0.004, segments=3))

seat = prism("chair_seat", rounded_rect(0.56, 0.13, 0.02, cz=RAIL + 0.088), -0.30, 0.225, col, [boucle])
box_uv(seat, scale=4)
parts.append(bevel(seat, 0.038, segments=7))
back = prism("chair_back", rounded_rect(0.56, 0.42, 0.03), -0.065, 0.065, col, [boucle])
box_uv(back, scale=4)
bevel(back, 0.036, segments=7)
back.location = (0, 0.285, 0.64)
back.rotation_euler = (math.radians(-15), 0, 0)
parts.append(back)

for ob in parts:
    if ob.type == "MESH" and ob.data.materials and ob.data.materials[0] == oak and not ob.data.uv_layers:
        box_uv(ob, scale=3)
    ob.parent = root

result = {"objects": len(col.objects)}
