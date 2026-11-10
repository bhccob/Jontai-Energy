"""Shared helpers for the round 9 product models (Blender 5.2).

Conventions: metres, Z up, the product's front faces -Y, origin at the centre of its base. Hard-surface parts are
closed prisms with a Bevel modifier (harden normals) and a Weighted Normal modifier, so large flat faces shade flat and
edges catch a thin highlight, which is what keeps a white box from looking like a toy. Materials stay inside what the
glTF exporter understands (Principled BSDF with image textures).
"""

import math

import bmesh
import bpy

ROOT = r"C:\Users\bhcco\Documents\Jontai-Energy\.claude\worktrees\v9"
HERE = ROOT + r"\tools\blender\products"
TEXTURES = HERE + r"\textures"


# ---------------------------------------------------------------- scene housekeeping

def fresh_collection(name):
    """An empty collection called `name` under the scene, replacing any earlier build of it."""
    old = bpy.data.collections.get(name)
    if old:
        for ob in list(old.all_objects):
            bpy.data.objects.remove(ob, do_unlink=True)
        bpy.data.collections.remove(old)
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col


def purge_orphans():
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.curves):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


# ---------------------------------------------------------------- profiles (x, z), counter-clockwise seen from the front

def rounded_rect(w, h, r, seg=14, corners=(True, True, True, True), cx=0.0, cz=0.0):
    """Corners in order bottom-left, bottom-right, top-right, top-left; False keeps that corner square."""
    arcs = [
        (-w / 2 + r, -h / 2 + r, math.pi, 1.5 * math.pi),
        (w / 2 - r, -h / 2 + r, 1.5 * math.pi, 2 * math.pi),
        (w / 2 - r, h / 2 - r, 0.0, 0.5 * math.pi),
        (-w / 2 + r, h / 2 - r, 0.5 * math.pi, math.pi),
    ]
    square = [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]
    pts = []
    for i, (ax, az, a0, a1) in enumerate(arcs):
        if corners[i]:
            for k in range(seg + 1):
                a = a0 + (a1 - a0) * k / seg
                pts.append((cx + ax + r * math.cos(a), cz + az + r * math.sin(a)))
        else:
            pts.append((cx + square[i][0], cz + square[i][1]))
    return pts


def squircle(w, h, n=4.0, count=128, cx=0.0, cz=0.0):
    """A superellipse: the soft square of a control panel's glass."""
    pts = []
    for i in range(count):
        t = 2 * math.pi * i / count
        c, s = math.cos(t), math.sin(t)
        x = (w / 2) * math.copysign(abs(c) ** (2 / n), c)
        z = (h / 2) * math.copysign(abs(s) ** (2 / n), s)
        pts.append((cx + x, cz + z))
    return pts


def circle(r, count=48, cx=0.0, cz=0.0):
    return [(cx + r * math.cos(2 * math.pi * i / count), cz + r * math.sin(2 * math.pi * i / count)) for i in range(count)]


# ---------------------------------------------------------------- solids

def prism(name, pts, y_front, y_back, col, materials=(), side_material=0, front_material=0, back_material=0):
    """A closed solid: the (x, z) profile from y_front (facing -Y) to y_back."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    front = [bm.verts.new((x, y_front, z)) for x, z in pts]
    back = [bm.verts.new((x, y_back, z)) for x, z in pts]
    f = bm.faces.new(front)
    f.material_index = front_material
    b = bm.faces.new(list(reversed(back)))
    b.material_index = back_material
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        s = bm.faces.new((front[j], front[i], back[i], back[j]))
        s.material_index = side_material
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    for m in materials:
        me.materials.append(m)
    return ob


def lathe(name, profile, col, material, segments=64):
    """A turned part: `profile` is [(radius, z)] from bottom to top, spun round Z."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    rings = []
    for r, z in profile:
        ring = []
        for i in range(segments):
            a = 2 * math.pi * i / segments
            ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), z)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(segments):
            j = (i + 1) % segments
            bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    me.materials.append(material)
    return ob


def rounded_poly(corners, seg=10):
    """A convex outline from [(x, z, radius)] corners in counter-clockwise order, each corner filleted by its radius."""
    pts = []
    n = len(corners)
    for i in range(n):
        x, z, r = corners[i]
        px, pz, _ = corners[i - 1]
        nx, nz, _ = corners[(i + 1) % n]
        if r <= 0:
            pts.append((x, z))
            continue
        a = (px - x, pz - z)
        b = (nx - x, nz - z)
        la, lb = math.hypot(*a), math.hypot(*b)
        a = (a[0] / la, a[1] / la)
        b = (b[0] / lb, b[1] / lb)
        half = math.acos(max(-1.0, min(1.0, a[0] * b[0] + a[1] * b[1]))) / 2
        t = r / math.tan(half)
        p0 = (x + a[0] * t, z + a[1] * t)
        p1 = (x + b[0] * t, z + b[1] * t)
        bis = (a[0] + b[0], a[1] + b[1])
        lbis = math.hypot(*bis)
        d = r / math.sin(half)
        cx, cz = x + bis[0] / lbis * d, z + bis[1] / lbis * d
        a0 = math.atan2(p0[1] - cz, p0[0] - cx)
        a1 = math.atan2(p1[1] - cz, p1[0] - cx)
        while a1 - a0 > math.pi:
            a1 -= 2 * math.pi
        while a0 - a1 > math.pi:
            a1 += 2 * math.pi
        for k in range(seg + 1):
            t2 = a0 + (a1 - a0) * k / seg
            pts.append((cx + r * math.cos(t2), cz + r * math.sin(t2)))
    return pts


def prism_x(name, pts, x0, x1, col, materials=(), **kw):
    """Like prism, but the (y, z) profile runs along X from x0 to x1 (an end-on profile, such as a side elevation)."""
    ob = prism(name, pts, x0, x1, col, materials, **kw)
    me = ob.data
    for v in me.vertices:
        px, py, pz = v.co
        v.co = (py, px, pz)
    me.flip_normals()
    me.update()
    return ob


def rod(name, a, b, r, col, material, sides=12, r_end=None):
    """A round bar from point a to point b (radius r, tapering to r_end), capped at both ends."""
    from mathutils import Vector

    a, b = Vector(a), Vector(b)
    axis = b - a
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=sides, radius1=r, radius2=r_end if r_end is not None else r, depth=axis.length)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    me.materials.append(material)
    ob.location = (a + b) / 2
    ob.rotation_mode = "QUATERNION"
    ob.rotation_quaternion = axis.normalized().to_track_quat("Z", "Y")
    return ob


def box_uv(ob, scale=1.0):
    """UVs by box projection in object space: each face takes the plane it faces most. `scale` is UV units per metre."""
    me = ob.data
    if not me.uv_layers:
        me.uv_layers.new(name="UVMap")
    uv = me.uv_layers.active.data
    for poly in me.polygons:
        nx, ny, nz = (abs(c) for c in poly.normal)
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            if nz >= nx and nz >= ny:
                uv[li].uv = (co.x * scale, co.y * scale)
            elif nx >= ny:
                uv[li].uv = (co.y * scale, co.z * scale)
            else:
                uv[li].uv = (co.x * scale, co.z * scale)


def bevel(ob, width, segments=5, angle=30, profile=0.5):
    m = ob.modifiers.new("Bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.profile = profile
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(angle)
    m.harden_normals = True
    m.miter_outer = "MITER_ARC"
    m.use_clamp_overlap = True
    wn = ob.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
    wn.weight = 100
    return ob


def cut(ob, cutters):
    """Boolean difference with each cutter, applied into the mesh; the cutters are deleted."""
    for c in cutters:
        m = ob.modifiers.new("Cut", "BOOLEAN")
        m.operation = "DIFFERENCE"
        m.solver = "EXACT"
        m.object = c
        c.hide_render = True
        c.hide_viewport = True
    dg = bpy.context.evaluated_depsgraph_get()
    # Only the booleans: other modifiers stay live on the object.
    keep = [(m.name, m.type) for m in ob.modifiers if m.type != "BOOLEAN"]
    for m in list(ob.modifiers):
        if m.type != "BOOLEAN":
            m.show_viewport = False
    dg.update()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    old = ob.data
    ob.data = me
    for m in list(ob.modifiers):
        if m.type == "BOOLEAN":
            ob.modifiers.remove(m)
        else:
            m.show_viewport = True
    bpy.data.meshes.remove(old)
    for c in cutters:
        bpy.data.objects.remove(c, do_unlink=True)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def planar_uv(ob, axis_u=0, axis_v=2, box=None):
    """UVs straight from the front: x to u, z to v, across `box` ((u0, v0), (u1, v1)) or the mesh's own bounds."""
    me = ob.data
    if not me.uv_layers:
        me.uv_layers.new(name="UVMap")
    uv = me.uv_layers.active.data
    co = [v.co for v in me.vertices]
    if box is None:
        us = [c[axis_u] for c in co]
        vs = [c[axis_v] for c in co]
        box = ((min(us), min(vs)), (max(us), max(vs)))
    (u0, v0), (u1, v1) = box
    for loop in me.loops:
        c = co[loop.vertex_index]
        uv[loop.index].uv = ((c[axis_u] - u0) / (u1 - u0), (c[axis_v] - v0) / (v1 - v0))


def place(ob, x=0.0, y=0.0, z=0.0, parent=None):
    ob.location = (x, y, z)
    if parent:
        ob.parent = parent
    return ob


def empty(name, col):
    e = bpy.data.objects.new(name, None)
    e.empty_display_type = "PLAIN_AXES"
    e.empty_display_size = 0.1
    col.objects.link(e)
    return e


# ---------------------------------------------------------------- materials

def material(name, color, rough=0.5, metal=0.0, coat=0.0, coat_rough=0.05, emit=None, emit_strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*color, 1.0)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = coat_rough
    if emit:
        p.inputs["Emission Color"].default_value = (*emit, 1.0)
        p.inputs["Emission Strength"].default_value = emit_strength
    return m


def textured(name, base_png, emit_png=None, emit_strength=0.0, rough=0.1, coat=0.0):
    """A face printed from images (screens, labels): base colour from one PNG, glow from another."""
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes.get("Principled BSDF")
    for n in [n for n in nt.nodes if n.type == "TEX_IMAGE"]:
        nt.nodes.remove(n)
    base = nt.nodes.new("ShaderNodeTexImage")
    base.image = bpy.data.images.load(TEXTURES + "\\" + base_png, check_existing=True)
    base.location = (-500, 200)
    nt.links.new(base.outputs["Color"], p.inputs["Base Color"])
    if emit_png:
        glow = nt.nodes.new("ShaderNodeTexImage")
        glow.image = bpy.data.images.load(TEXTURES + "\\" + emit_png, check_existing=True)
        glow.location = (-500, -200)
        nt.links.new(glow.outputs["Color"], p.inputs["Emission Color"])
        p.inputs["Emission Strength"].default_value = emit_strength
    p.inputs["Roughness"].default_value = rough
    p.inputs["Coat Weight"].default_value = coat
    return m


# Linear sRGB values. Whites sit below 0.8 so the key light can still model them.
def palette():
    return {
        "white": material("je_white_powder", (0.74, 0.75, 0.74), rough=0.42),
        "white_gloss": material("je_white_gloss", (0.78, 0.78, 0.77), rough=0.16, coat=0.4),
        "black_gloss": material("je_black_gloss", (0.008, 0.009, 0.009), rough=0.06, coat=1.0),
        "gap": material("je_gap", (0.02, 0.022, 0.021), rough=0.85),
        "steel": material("je_steel", (0.70, 0.71, 0.72), rough=0.32, metal=1.0),
        "rubber": material("je_rubber", (0.018, 0.019, 0.019), rough=0.72),
    }
