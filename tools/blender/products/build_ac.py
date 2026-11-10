"""The split solar air conditioner, after public/catalog/solar-ac.webp: a gloss-white indoor unit (soft front, louver,
top intake slots, set-temperature display) and a painted outdoor unit (fan behind a wire grille, brass service valves,
feet). Two collections, ac_indoor (0.84 x 0.28 x 0.20 m) and ac_outdoor (0.76 x 0.57 x 0.27 m), each standing on z = 0.
Run inside Blender: exec(open(<this file>).read()).
"""

import importlib
import math
import sys

HERE = r"C:\Users\bhcco\Documents\Jontai-Energy\.claude\worktrees\v9\tools\blender\products"
if HERE not in sys.path:
    sys.path.insert(0, HERE)
import common  # noqa: E402

importlib.reload(common)
from common import (  # noqa: E402
    bevel, circle, cut, empty, fresh_collection, lathe, material, palette, planar_uv, prism, prism_x, rod,
    rounded_poly, rounded_rect, textured,
)

mat = palette()
gloss = material("je_ac_white", (0.76, 0.77, 0.76), rough=0.22, coat=0.35)
painted = material("je_ac_grey", (0.56, 0.575, 0.58), rough=0.46)
painted_dark = material("je_ac_grey_dark", (0.30, 0.31, 0.315), rough=0.5)
grille = material("je_ac_grille", (0.66, 0.67, 0.68), rough=0.35, metal=0.5)
fan = material("je_ac_fan", (0.035, 0.038, 0.04), rough=0.45)
brass = material("je_brass", (0.80, 0.56, 0.26), rough=0.28, metal=1.0)
display = textured("je_ac_display", "ac-display-base.png", "ac-display-emit.png", emit_strength=2.0, rough=0.05, coat=1.0)

# ---------------------------------------------------------------- indoor unit

W, D, H = 0.84, 0.20, 0.28
col = fresh_collection("ac_indoor")
root = empty("ac_indoor", col)
parts = []
profile = rounded_poly([(-D / 2, 0.0, 0.075), (D / 2, 0.0, 0.01), (D / 2, H, 0.01), (-D / 2, H, 0.03)], seg=12)
body = prism_x("ac_in_body", profile, -W / 2, W / 2, col, [gloss])
parts.append(bevel(body, 0.014, segments=7))
# The louver: a dark mouth under the front with the flap across it.
parts.append(prism_x("ac_in_mouth", rounded_rect(0.07, 0.016, 0.004, cx=-0.055, cz=0.006), -W / 2 + 0.03, W / 2 - 0.03, col, [mat["gap"]]))
flap = prism_x("ac_in_flap", rounded_poly([(-0.108, 0.002, 0.004), (-0.03, -0.004, 0.004), (-0.03, 0.004, 0.004), (-0.106, 0.012, 0.004)], seg=3), -W / 2 + 0.035, W / 2 - 0.035, col, [gloss])
parts.append(bevel(flap, 0.002, segments=2))
# The front panel's seam and the intake slots along the top front edge.
parts.append(prism("ac_in_seam", rounded_rect(W - 0.05, 0.0024, 0.001, cz=0.083), -D / 2 - 0.0012, -D / 2 + 0.002, col, [mat["gap"]]))
for i in range(8):
    x = -W / 2 + 0.07 + i * ((W - 0.14) / 7)
    parts.append(prism("ac_in_slot", rounded_rect(0.07, 0.003, 0.0012, cx=x, cz=H + 0.0004), -D / 2 + 0.03, -D / 2 + 0.042, col, [mat["gap"]]))
glass = prism("ac_in_display", rounded_rect(0.06, 0.03, 0.005, cx=0.31, cz=0.115), -D / 2 - 0.0022, -D / 2 + 0.001, col, [display, mat["black_gloss"]], front_material=0, side_material=1, back_material=1)
planar_uv(glass, box=((0.28, 0.10), (0.34, 0.13)))
parts.append(bevel(glass, 0.001, segments=2))
for ob in parts:
    ob.parent = root

# ---------------------------------------------------------------- outdoor unit

W, D = 0.76, 0.27
YF = -D / 2
BASE = 0.05
col = fresh_collection("ac_outdoor")
root = empty("ac_outdoor", col)
parts = []
FX, FZ, R = -0.105, BASE + 0.262, 0.205

body = prism("ac_out_body", rounded_rect(W, 0.52, 0.008, cz=BASE + 0.26), YF, -YF, col, [painted])
cut(body, [prism("cut", circle(R, 128, cx=FX, cz=FZ), YF - 0.02, YF + 0.03, col)])
parts.append(bevel(body, 0.005, segments=4))
parts.append(prism("ac_out_dark", circle(R + 0.002, 96, cx=FX, cz=FZ), YF + 0.026, YF + 0.0295, col, [mat["gap"]]))

# The fan: a hub and three pitched blades, behind the grille.
hub = lathe("ac_out_hub", [(0.0001, 0.0), (0.05, 0.0), (0.05, 0.016), (0.038, 0.03), (0.0001, 0.034)], col, fan, segments=48)
hub.location = (FX, YF + 0.026, FZ)
hub.rotation_euler = (math.pi / 2, 0, 0)
parts.append(hub)
spinner = empty("ac_out_fan", col)
spinner.location = (FX, YF + 0.017, FZ)
spinner.parent = root
blade_shape = rounded_poly([(0.04, -0.035, 0.02), (0.185, -0.075, 0.05), (0.19, 0.055, 0.05), (0.05, 0.04, 0.02)], seg=8)
for k in range(3):
    b = prism("ac_out_blade", blade_shape, -0.0025, 0.0025, col, [fan])
    b.rotation_euler = (math.radians(26), k * 2 * math.pi / 3, 0)
    b.parent = spinner
    bevel(b, 0.0015, segments=2)

# The wire grille: fine verticals, a few horizontals, a heavier square frame.
gy = YF - 0.007
half = R + 0.012
for i in range(17):
    x = FX - half + (2 * half) * (i + 0.5) / 17
    parts.append(rod("ac_out_wire", (x, gy, FZ - half), (x, gy, FZ + half), 0.0017, col, grille, sides=8))
for i in range(7):
    z = FZ - half + (2 * half) * (i + 0.5) / 7
    parts.append(rod("ac_out_wire", (FX - half, gy - 0.0025, z), (FX + half, gy - 0.0025, z), 0.0017, col, grille, sides=8))
for (ax, az), (bx, bz) in (((-1, -1), (1, -1)), ((1, -1), (1, 1)), ((1, 1), (-1, 1)), ((-1, 1), (-1, -1))):
    parts.append(rod("ac_out_frame", (FX + ax * half, gy, FZ + az * half), (FX + bx * half, gy, FZ + bz * half), 0.003, col, grille, sides=10))

# Service valves on the right side, near the front; the terminal cover above them.
for z in (BASE + 0.07, BASE + 0.13):
    v = lathe("ac_out_valve", [(0.0001, 0.0), (0.013, 0.0), (0.013, 0.018), (0.010, 0.022), (0.010, 0.04), (0.007, 0.046), (0.0001, 0.046)], col, brass, segments=24)
    v.location = (W / 2 - 0.002, YF + 0.045, z)
    v.rotation_euler = (0, math.pi / 2, 0)
    parts.append(v)
cover = prism_x("ac_out_cover", rounded_rect(0.13, 0.16, 0.01, cx=YF + 0.09, cz=BASE + 0.36), W / 2 - 0.004, W / 2 + 0.008, col, [painted])
parts.append(bevel(cover, 0.003, segments=3))

# Feet: two bent rails front to back.
for x in (-0.26, 0.26):
    parts.append(bevel(prism("ac_out_foot", rounded_rect(0.07, BASE, 0.006, cx=x, cz=BASE / 2), YF - 0.012, -YF + 0.012, col, [painted_dark]), 0.004))

for ob in parts:
    ob.parent = root

result = {"ok": True}
