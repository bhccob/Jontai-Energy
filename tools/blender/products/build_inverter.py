"""The hybrid inverter (SPI-8K-UP style wall unit), after public/products/spi-inverter.webp.

A powder-white body with a separate lower cover, a raised gloss bezel round black glass (LCD, three status lights,
four touch keys), the galvanised wall bracket showing above the top, two screws on each side and cable glands below.
About 0.40 x 0.55 x 0.14 m. Run inside Blender: exec(open(<this file>).read()).
"""

import importlib
import math
import sys

HERE = r"C:\Users\bhcco\Documents\Jontai-Energy\.claude\worktrees\v9\tools\blender\products"
if HERE not in sys.path:
    sys.path.insert(0, HERE)
import common  # noqa: E402

importlib.reload(common)
from common import bevel, circle, cut, empty, fresh_collection, lathe, palette, planar_uv, prism, rounded_rect, squircle, textured  # noqa: E402

W, H, D = 0.40, 0.55, 0.14
YF, YB = -D / 2, D / 2
SPLIT = 0.099  # where the lower cover meets the body
R = 0.03  # outline corner radius

col = fresh_collection("inverter")
mat = palette()
face = textured("je_inverter_face", "inverter-base.png", "inverter-emit.png", emit_strength=2.5, rough=0.05, coat=1.0)
root = empty("inverter", col)

# Body and lower cover, each a rounded outline with soft front and back edges; the seam between them is a dark slot.
body = prism("inverter_body", rounded_rect(W, H - SPLIT - 0.001, R, corners=(False, False, True, True), cz=(H + SPLIT + 0.001) / 2), YF, YB, col, [mat["white"]])
cover = prism("inverter_cover", rounded_rect(W, SPLIT - 0.001, R, corners=(True, True, False, False), cz=(SPLIT - 0.001) / 2), YF, YB, col, [mat["white"]])
seam = prism("inverter_seam", rounded_rect(W - 0.012, 0.012, 0.002, cz=SPLIT), YF + 0.006, YB - 0.006, col, [mat["gap"]])
for ob in (body, cover):
    bevel(ob, 0.0075, segments=6)

# The control panel: a raised gloss rim, the glass in it.
PZ = 0.372
rim = prism("inverter_rim", squircle(0.132, 0.126, n=4.2, cz=PZ), YF - 0.0048, YF + 0.004, col, [mat["white_gloss"]])
bevel(rim, 0.0032, segments=6)
glass = prism(
    "inverter_glass", squircle(0.108, 0.102, n=4.8, cz=PZ), YF - 0.0058, YF - 0.002, col,
    [face, mat["black_gloss"]], side_material=1, back_material=1, front_material=0,
)
planar_uv(glass, box=((-0.054, PZ - 0.051), (0.054, PZ + 0.051)))
bevel(glass, 0.0014, segments=4)

# The wall bracket behind, showing above the top, with two keyholes.
bracket = prism("inverter_bracket", rounded_rect(0.27, 0.11, 0.012, corners=(False, False, True, True), cz=H + 0.034 - 0.055), 0.050, 0.054, col, [mat["steel"]])
holes = []
for x in (-0.09, 0.09):
    holes.append(prism("hole", circle(0.0068, cx=x, cz=H + 0.017), 0.03, 0.08, col))
    holes.append(prism("slot", rounded_rect(0.0046, 0.014, 0.0022, cx=x, cz=H + 0.017 - 0.007), 0.03, 0.08, col))
cut(bracket, holes)
bevel(bracket, 0.0009, segments=2)

# Side screws, two per side near the front edge.
screw = [(0.0001, 0.0), (0.0044, 0.0), (0.0044, 0.0008), (0.0036, 0.0018), (0.002, 0.0024), (0.0001, 0.0025)]
for side in (-1, 1):
    for z in (0.16, 0.47):
        s = lathe("inverter_screw", screw, col, mat["steel"], segments=24)
        s.location = (side * W / 2, YF + 0.03, z)
        s.rotation_euler = (0, side * math.pi / 2, 0)
        s.parent = root

# Cable glands along the bottom.
gland = [(0.0001, 0.0), (0.0105, 0.0), (0.0105, 0.0055), (0.0088, 0.0065), (0.0088, 0.0125), (0.0062, 0.014), (0.0001, 0.014)]
for x in (-0.135, -0.075, -0.015, 0.06, 0.12):
    g = lathe("inverter_gland", gland, col, mat["rubber"], segments=32)
    g.location = (x, 0.006, 0.0)
    g.rotation_euler = (math.pi, 0, 0)
    g.parent = root

for ob in (body, cover, seam, rim, glass, bracket):
    ob.parent = root

# The glands hang 14 mm below the body; lift the unit so it rests on them and the floor stays at z = 0.
root.location.z = 0.014

result = {"objects": len(col.objects), "root": root.name}
