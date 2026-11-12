"""A framed monocrystalline solar panel, after public/catalog/solar-panels.webp: 60 cells under glass in a silver
anodised frame, white backsheet and junction box behind. 1.00 x 1.65 x 0.035 m, standing on its short edge.
Run inside Blender: exec(open(<this file>).read()).
"""

import importlib
import sys

HERE = r"C:\Users\bhcco\Documents\Jontai-Energy\.claude\worktrees\v9\tools\blender\products"
if HERE not in sys.path:
    sys.path.insert(0, HERE)
import common  # noqa: E402

importlib.reload(common)
from common import bevel, cut, empty, fresh_collection, material, palette, planar_uv, prism, rounded_rect, textured  # noqa: E402

W, H, D = 1.0, 1.65, 0.035
LIP = 0.022  # how much frame shows from the front
GLASS = 0.016  # how far the glass runs in under the lip

col = fresh_collection("solar_panel")
mat = palette()
alu = material("je_alu", (0.80, 0.81, 0.82), rough=0.26, metal=1.0)
backsheet = material("je_backsheet", (0.78, 0.79, 0.78), rough=0.62)
# Slightly soft glass: reflections sweep across as a gradient instead of showing the softbox as a hard square.
cells = textured("je_panel_cells", "panel-cells-base.png", rough=0.42, coat=0.18)
root = empty("solar_panel", col)

frame = prism("panel_frame", rounded_rect(W, H, 0.002, seg=2, cz=H / 2), -D / 2, D / 2, col, [alu])
opening = prism("cut", rounded_rect(W - 2 * LIP, H - 2 * LIP, 0.0015, seg=2, cz=H / 2), -D, D, col)
cut(frame, [opening])
bevel(frame, 0.0012, segments=3)

gw, gh = W - 2 * GLASS, H - 2 * GLASS
laminate = prism(
    "panel_glass", rounded_rect(gw, gh, 0.001, seg=1, cz=H / 2), -D / 2 + 0.004, -D / 2 + 0.0085, col,
    [cells, backsheet], front_material=0, side_material=1, back_material=1,
)
planar_uv(laminate, box=((-gw / 2, H / 2 - gh / 2), (gw / 2, H / 2 + gh / 2)))

box = prism("panel_junction", rounded_rect(0.13, 0.085, 0.008, cz=H - 0.22), -D / 2 + 0.0085, -D / 2 + 0.03, col, [mat["rubber"]])
bevel(box, 0.003, segments=3)

for ob in (frame, laminate, box):
    ob.parent = root

result = {"objects": len(col.objects)}
