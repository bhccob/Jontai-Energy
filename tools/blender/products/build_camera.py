"""The solar site camera, after public/catalog/camera-site.webp: a galvanised pole on a bolted flange, a white bullet
camera on a side bracket, and a small framed solar panel tilted on a swivel at the top. About 1.25 m tall.
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
from common import bevel, cut, empty, fresh_collection, lathe, material, palette, planar_uv, prism, rod, rounded_rect, textured  # noqa: E402

col = fresh_collection("site_camera")
mat = palette()
galv = material("je_galvanised", (0.60, 0.62, 0.63), rough=0.42, metal=0.8)
white = material("je_camera_white", (0.78, 0.79, 0.78), rough=0.24, coat=0.4)
alu = material("je_alu", (0.80, 0.81, 0.82), rough=0.26, metal=1.0)
lens = material("je_lens", (0.02, 0.035, 0.06), rough=0.03, coat=1.0)
ir = material("je_ir", (0.85, 0.85, 0.82), rough=0.2, emit=(1.0, 0.97, 0.9), emit_strength=0.8)
cells = textured("je_mini_cells", "mini-cells-base.png", rough=0.16, coat=0.6)
root = empty("site_camera", col)
parts = []

POLE = 1.0
R = 0.036
parts.append(lathe("cam_flange", [(0.0001, 0.0), (0.1, 0.0), (0.1, 0.008), (0.096, 0.011), (0.042, 0.011), (0.04, 0.03), (0.0001, 0.03)], col, galv, segments=64))
for k in range(4):
    a = math.pi / 4 + k * math.pi / 2
    b = lathe("cam_bolt", [(0.0001, 0.0), (0.009, 0.0), (0.009, 0.006), (0.006, 0.01), (0.0001, 0.011)], col, galv, segments=6)
    b.location = (0.074 * math.cos(a), 0.074 * math.sin(a), 0.011)
    parts.append(b)
parts.append(rod("cam_pole", (0, 0, 0.02), (0, 0, POLE), R, col, galv, sides=40))
parts.append(lathe("cam_pole_cap", [(0.0001, 0.0), (R + 0.002, 0.0), (R + 0.002, 0.012), (0.02, 0.02), (0.0001, 0.022)], col, galv, segments=40))
parts[-1].location = (0, 0, POLE)

# The bullet camera on a bracket on the pole's front, looking forward.
CZ = 0.85
plate = prism("cam_bracket", rounded_rect(0.07, 0.12, 0.01, cz=CZ), -R - 0.012, -R + 0.006, col, [white])
parts.append(bevel(plate, 0.003, segments=3))
arm = prism("cam_arm", rounded_rect(0.04, 0.05, 0.012, cz=CZ), -R - 0.06, -R - 0.01, col, [white])
parts.append(bevel(arm, 0.004, segments=3))
body = prism("cam_body", rounded_rect(0.088, 0.082, 0.032, cz=CZ + 0.006), -R - 0.27, -R - 0.05, col, [white])
parts.append(bevel(body, 0.006, segments=5))
shield = prism("cam_shield", rounded_rect(0.096, 0.012, 0.005, corners=(False, False, True, True), cz=CZ + 0.052), -R - 0.30, -R - 0.06, col, [white])
parts.append(bevel(shield, 0.003, segments=3))
face = prism("cam_face", rounded_rect(0.074, 0.068, 0.026, cz=CZ + 0.006), -R - 0.276, -R - 0.268, col, [mat["black_gloss"]])
parts.append(bevel(face, 0.002, segments=3))
barrel = lathe("cam_lens", [(0.0001, 0.0), (0.017, 0.0), (0.017, 0.006), (0.013, 0.009), (0.0001, 0.009)], col, lens, segments=40)
barrel.location = (0, -R - 0.276, CZ + 0.008)
barrel.rotation_euler = (math.pi / 2, 0, 0)
parts.append(barrel)
for x in (-0.026, 0.026):
    led = lathe("cam_ir", [(0.0001, 0.0), (0.0065, 0.0), (0.0065, 0.003), (0.0001, 0.004)], col, ir, segments=20)
    led.location = (x, -R - 0.276, CZ + 0.008)
    led.rotation_euler = (math.pi / 2, 0, 0)
    parts.append(led)

# The panel on its swivel, tilted toward the front.
parts.append(rod("cam_mast", (0, 0, POLE + 0.01), (0, 0, POLE + 0.08), 0.017, col, galv, sides=24))
parts.append(rod("cam_knuckle", (-0.03, 0, POLE + 0.09), (0.03, 0, POLE + 0.09), 0.02, col, galv, sides=24))
panel = empty("cam_panel", col)
panel.location = (0, -0.01, POLE + 0.11)
panel.rotation_euler = (math.radians(28), 0, 0)
panel.parent = root
PW, PH = 0.44, 0.29
frame = prism("cam_panel_frame", rounded_rect(PW, PH, 0.004), -0.009, 0.009, col, [alu])
cut(frame, [prism("cut", rounded_rect(PW - 0.024, PH - 0.024, 0.002), -0.05, 0.05, col)])
bevel(frame, 0.001, segments=2)
# Built upright like the big panel, then laid back so the cells face up.
frame.rotation_euler = (-math.pi / 2, 0, 0)
frame.parent = panel
lam = prism("cam_panel_glass", rounded_rect(PW - 0.012, PH - 0.012, 0.001), -0.006, -0.002, col, [cells, mat["rubber"]], front_material=0, side_material=1, back_material=1)
planar_uv(lam, box=((-(PW - 0.012) / 2, -(PH - 0.012) / 2), ((PW - 0.012) / 2, (PH - 0.012) / 2)))
lam.rotation_euler = (-math.pi / 2, 0, 0)
lam.parent = panel

for ob in parts:
    ob.parent = root

result = {"objects": len(col.objects)}
