"""The 3000 W portable power station, after public/catalog/power-station.webp: a graphite body between a silver top
shell and base trim, chunky silver corner caps carrying the two carry handles, and a silver front plate with the colour
screen, four US outlets, USB and DC ports, the 12 V socket and two light bars. Vents on both sides.
About 0.46 x 0.36 x 0.30 m. Run inside Blender: exec(open(<this file>).read()).
"""

import importlib
import math
import sys

HERE = r"C:\Users\bhcco\Documents\Jontai-Energy\.claude\worktrees\v9\tools\blender\products"
if HERE not in sys.path:
    sys.path.insert(0, HERE)
import common  # noqa: E402

importlib.reload(common)
from common import bevel, circle, empty, fresh_collection, lathe, material, palette, planar_uv, prism, rounded_rect, textured  # noqa: E402

W, D = 0.46, 0.30
YF = -D / 2

col = fresh_collection("power_station")
mat = palette()
graphite = material("je_graphite", (0.105, 0.11, 0.115), rough=0.52)
silver = material("je_silver", (0.58, 0.60, 0.62), rough=0.34, metal=0.35)
handle_mat = material("je_handle", (0.075, 0.078, 0.082), rough=0.6)
light = material("je_lightbar", (0.9, 0.9, 0.88), rough=0.3, emit=(1.0, 0.98, 0.94), emit_strength=1.6)
plate_mat = textured("je_station_plate", "station-plate-base.png", rough=0.34)
screen = textured("je_station_screen", "station-screen-base.png", "station-screen-emit.png", emit_strength=2.2, rough=0.05, coat=1.0)
outlet = textured("je_outlet", "outlet-base.png", rough=0.5)
root = empty("power_station", col)
parts = []

# Graphite body, silver top shell and base trim.
parts.append(bevel(prism("station_body", rounded_rect(W - 0.012, 0.24, 0.01, cz=0.155), YF + 0.006, -YF - 0.006, col, [graphite]), 0.006))
parts.append(bevel(prism("station_top", rounded_rect(W, 0.07, 0.02, corners=(False, False, True, True), cz=0.295), YF, -YF, col, [silver]), 0.006))
parts.append(bevel(prism("station_base", rounded_rect(W, 0.046, 0.014, corners=(True, True, False, False), cz=0.035), YF, -YF, col, [silver]), 0.005))

# Corner caps: chamfered blocks rising above the shell at all four top corners.
CAP = 0.078
for side in (-1, 1):
    pts = [(0, 0), (CAP, 0), (CAP, 0.05), (CAP - 0.034, 0.088), (0, 0.088)]
    pts = [(side * (W / 2 - x), 0.262 + z) for x, z in pts]
    if side < 0:
        pts.reverse()
    for y0, y1 in ((YF - 0.002, YF + CAP), (-YF - CAP, -YF + 0.002)):
        parts.append(bevel(prism("station_cap", pts, y0, y1, col, [silver]), 0.006, segments=5))
    # The carry handle spans the gap between the front and back caps.
    parts.append(bevel(prism("station_handle", rounded_rect(0.03, 0.024, 0.01, cx=side * (W / 2 - CAP / 2), cz=0.336), YF + CAP - 0.01, -YF - CAP + 0.01, col, [handle_mat]), 0.003))

# The front plate, its screen, outlets, 12 V socket and light bars.
PW, PH, PZ = 0.385, 0.205, 0.16
plate = prism("station_plate", rounded_rect(PW, PH, 0.016, cz=PZ), YF - 0.003, YF + 0.01, col, [plate_mat, silver], front_material=0, side_material=1, back_material=1)
planar_uv(plate, box=((-PW / 2, PZ - PH / 2), (PW / 2, PZ + PH / 2)))
parts.append(bevel(plate, 0.0025, segments=3))
glass = prism("station_screen", rounded_rect(0.132, 0.064, 0.004, cz=0.216), YF - 0.0052, YF - 0.002, col, [screen, mat["black_gloss"]], front_material=0, side_material=1, back_material=1)
planar_uv(glass, box=((-0.066, 0.216 - 0.032), (0.066, 0.216 + 0.032)))
parts.append(bevel(glass, 0.0012, segments=2))
for x in (-0.1125, -0.0375, 0.0375, 0.1125):
    o = prism("station_outlet", rounded_rect(0.05, 0.05, 0.006, cx=x, cz=0.106), YF - 0.0075, YF - 0.002, col, [outlet, mat["rubber"]], front_material=0, side_material=1, back_material=1)
    planar_uv(o, box=((x - 0.025, 0.081), (x + 0.025, 0.131)))
    parts.append(bevel(o, 0.0015, segments=2))
for x in (-0.172, 0.172):
    parts.append(bevel(prism("station_light", rounded_rect(0.013, 0.15, 0.006, cx=x, cz=PZ), YF - 0.0048, YF - 0.002, col, [light]), 0.001, segments=2))
ring = prism("station_socket_ring", circle(0.019, cx=0.118, cz=0.216), YF - 0.009, YF - 0.002, col, [silver])
parts.append(bevel(ring, 0.002, segments=3))
cap = prism("station_socket", circle(0.014, cx=0.118, cz=0.216), YF - 0.013, YF - 0.008, col, [mat["rubber"]])
parts.append(bevel(cap, 0.002, segments=3))

# Side vents: a dark recess with slats, on both sides.
for side in (-1, 1):
    recess = prism("station_vent", rounded_rect(0.15, 0.14, 0.01, cz=0.16), -0.002, 0.004, col, [mat["gap"]])
    recess.rotation_euler = (0, 0, math.pi / 2)
    recess.location = (side * (W / 2 - 0.006 + 0.004), 0, 0)
    parts.append(recess)
    for i in range(9):
        z = 0.098 + i * 0.0155
        s = prism("station_slat", rounded_rect(0.142, 0.0068, 0.002, cz=z), -0.0005, 0.0035, col, [graphite])
        s.rotation_euler = (0, 0, math.pi / 2)
        s.location = (side * (W / 2 - 0.006 + 0.0045), 0, 0)
        parts.append(s)

# Rubber feet.
foot = [(0.0001, 0.0), (0.017, 0.0), (0.017, 0.009), (0.015, 0.012), (0.0001, 0.012)]
for x in (-W / 2 + 0.05, W / 2 - 0.05):
    for y in (YF + 0.05, -YF - 0.05):
        f = lathe("station_foot", foot, col, mat["rubber"], segments=24)
        f.location = (x, y, 0.0)
        parts.append(f)

for ob in parts:
    ob.parent = root

result = {"objects": len(col.objects)}
