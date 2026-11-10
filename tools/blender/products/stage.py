"""The after-hours showroom for Cycles stills: a seamless deep-forest cyclorama, a warm key, a mint rim, a faint fill.

Colour management is Khronos PBR Neutral, the same curve the web stage uses (three.js NeutralToneMapping), so a still
and the live scene agree. Run inside Blender after a product build: exec(open(<this file>).read()), then call
frame(<root name>, ...) and render(<path>).
"""

import math
import sys

import bpy
from mathutils import Vector

HERE = r"C:\Users\bhcco\Documents\Jontai-Energy\.claude\worktrees\v9\tools\blender\products"
if HERE not in sys.path:
    sys.path.insert(0, HERE)
from common import fresh_collection, material  # noqa: E402

# #0f281d, the page's deep forest, in linear sRGB.
DEEP = (0.0048, 0.0212, 0.0123)


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def build_stage():
    col = fresh_collection("stage")
    scene = bpy.context.scene

    # World: the deep forest, dim, so reflections pick up the room's colour.
    world = bpy.data.worlds.get("after_hours") or bpy.data.worlds.new("after_hours")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = (*DEEP, 1.0)
    bg.inputs["Strength"].default_value = 1.0
    scene.world = world

    # Cyclorama: floor sweeping up into a back wall, so there is no horizon line.
    import bmesh

    me = bpy.data.meshes.new("cyc")
    bm = bmesh.new()
    prof = [(-6.0, 0.0), (1.2, 0.0)]
    for i in range(1, 17):
        a = (i / 16) * (math.pi / 2)
        prof.append((1.2 + 2.0 * math.sin(a), 2.0 * (1 - math.cos(a))))
    prof.append((3.2, 6.0))
    left = [bm.verts.new((-8.0, y, z)) for y, z in prof]
    right = [bm.verts.new((8.0, y, z)) for y, z in prof]
    for i in range(len(prof) - 1):
        bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    cyc = bpy.data.objects.new("cyclorama", me)
    col.objects.link(cyc)
    floor = material("je_stage_floor", tuple(c * 1.1 for c in DEEP), rough=0.7)
    me.materials.append(floor)

    def area(name, size, power, color, loc, aim, size_y=None, spread=180):
        light = bpy.data.lights.new(name, "AREA")
        light.shape = "RECTANGLE"
        light.size = size
        light.size_y = size_y or size
        light.energy = power
        light.color = color
        light.spread = math.radians(spread)
        ob = bpy.data.objects.new(name, light)
        ob.location = loc
        direction = Vector(aim) - Vector(loc)
        ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        col.objects.link(ob)
        return ob

    # Tuned against the inverter (checkpoint A, 2026-11-10): a front-right key so the front reads white and the side
    # falls into shade, a narrow mint rim from behind left, a faint cool fill. The web studio mirrors these.
    area("key", 1.0, 14, (1.0, 0.94, 0.86), (0.9, -2.2, 1.9), (0, 0, 0.3), size_y=0.7, spread=60)
    area("rim", 0.3, 7, (0.70, 0.95, 0.78), (-1.0, 1.0, 1.1), (-0.15, 0, 0.35), size_y=1.4, spread=35)
    area("fill", 2.0, 1.5, (0.88, 0.94, 1.0), (-2.0, -1.4, 0.5), (0, 0, 0.3), size_y=1.2, spread=80)

    scene.render.engine = "CYCLES"
    scene.cycles.device = "GPU"
    scene.cycles.samples = 384
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = "OPTIX"
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Khronos PBR Neutral"
    scene.view_settings.look = "None"
    scene.view_settings.exposure = 0.0
    scene.display_settings.display_device = "sRGB"
    return col


def frame(target_root, res=(1600, 1600), lens=70, azimuth=-32, elevation=10, distance=2.2, aim_z=None):
    """A camera on the product: azimuth in degrees from straight ahead (negative swings left), elevation above level."""
    scene = bpy.context.scene
    root = bpy.data.objects[target_root]
    zs = [(ob.matrix_world @ Vector(c)).z for ob in root.children_recursive if ob.type == "MESH" for c in ob.bound_box]
    centre_z = aim_z if aim_z is not None else (min(zs) + max(zs)) / 2
    cam = bpy.data.objects.get("stage_camera")
    if not cam:
        cam = bpy.data.objects.new("stage_camera", bpy.data.cameras.new("stage_camera"))
        bpy.data.collections["stage"].objects.link(cam)
    cam.data.lens = lens
    az, el = math.radians(azimuth), math.radians(elevation)
    loc = Vector((distance * math.sin(az) * math.cos(el), -distance * math.cos(az) * math.cos(el), centre_z + distance * math.sin(el)))
    cam.location = loc
    cam.rotation_euler = (Vector((0, 0, centre_z)) - loc).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.resolution_percentage = 100
    return cam


PRODUCTS = ("inverter", "solar_panel", "power_station", "ac_indoor", "ac_outdoor", "site_camera", "lounge_chair", "loyalty_card")


def solo(*names):
    """Render only these product collections (the stage stays)."""
    for n in PRODUCTS:
        c = bpy.data.collections.get(n)
        if c:
            c.hide_render = n not in names
            c.hide_viewport = n not in names


def render(path):
    scene = bpy.context.scene
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    return path
