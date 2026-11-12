"""Export one product's GLB and bake its contact shadow, from the open showroom.blend.

Run inside Blender after its build script: exec(open(<this file>).read(), ns); ns["publish_product"]("inverter").
Writes tools/blender/products/out/<name>.glb and <name>-shadow.png; tools/blender/products/publish.mjs turns them into
what the site serves.
"""

import bpy

OUT = r"C:\Users\bhcco\Documents\Jontai-Energy\.claude\worktrees\v9\tools\blender\products\out"


def export_glb(root_name):
    bpy.ops.object.select_all(action="DESELECT")
    for ob in bpy.data.collections[root_name].all_objects:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = bpy.data.objects[root_name]
    path = f"{OUT}\\{root_name}.glb"
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_apply=True, export_yup=True,
        export_texcoords=True, export_normals=True, export_materials="EXPORT",
        export_cameras=False, export_lights=False, export_extras=False,
    )
    return path


def bake_shadow(root_name, size=(0.9, 0.6), px=768):
    """Top-down contact shadow: a shadow catcher under a soft white sky and one soft light overhead, film transparent.
    The product is hidden from the camera but still casts; alpha is the shadow."""
    scene = bpy.context.scene
    stage = bpy.data.collections.get("stage")
    saved = (scene.render.film_transparent, scene.camera, scene.render.resolution_x, scene.render.resolution_y,
             scene.world, scene.cycles.samples, stage.hide_render if stage else None)
    if stage:
        stage.hide_render = True
    # Every product is built at the origin, so all the others must leave the render or they shadow this one's floor.
    others = [c for c in scene.collection.children if c.name not in (root_name, "stage")]
    others_hidden = [c.hide_render for c in others]
    for c in others:
        c.hide_render = True
    sky = bpy.data.worlds.get("shadow_sky") or bpy.data.worlds.new("shadow_sky")
    sky.use_nodes = True
    sky.node_tree.nodes["Background"].inputs["Color"].default_value = (1, 1, 1, 1)
    sky.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
    scene.world = sky
    light = bpy.data.lights.new("shadow_top", "AREA")
    light.size = 0.8
    light.energy = 40
    top = bpy.data.objects.new("shadow_top", light)
    top.location = (0, 0, 2.0)
    scene.collection.objects.link(top)
    w, d = size
    me = bpy.data.meshes.new("catcher")
    me.from_pydata([(-w / 2, -d / 2, 0), (w / 2, -d / 2, 0), (w / 2, d / 2, 0), (-w / 2, d / 2, 0)], [], [(0, 1, 2, 3)])
    catcher = bpy.data.objects.new("catcher", me)
    catcher.is_shadow_catcher = True
    scene.collection.objects.link(catcher)
    cam_data = bpy.data.cameras.new("shadow_cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = max(w, d)
    cam = bpy.data.objects.new("shadow_cam", cam_data)
    cam.location = (0, 0, 3.0)
    scene.collection.objects.link(cam)
    meshes = [o for o in bpy.data.collections[root_name].all_objects if o.type == "MESH"]
    for o in meshes:
        o.visible_camera = False
    scene.camera = cam
    scene.render.film_transparent = True
    scene.render.resolution_x = px
    scene.render.resolution_y = round(px * d / w)
    scene.cycles.samples = 256
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    path = f"{OUT}\\{root_name}-shadow.png"
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    for o in meshes:
        o.visible_camera = True
    for ob in (catcher, top, cam):
        bpy.data.objects.remove(ob, do_unlink=True)
    (scene.render.film_transparent, scene.camera, scene.render.resolution_x, scene.render.resolution_y,
     scene.world, scene.cycles.samples, hidden) = saved
    if stage:
        stage.hide_render = hidden
    for c, h in zip(others, others_hidden):
        c.hide_render = h
    scene.render.image_settings.color_mode = "RGB"
    return path


def publish_product(root_name, shadow_size=(0.9, 0.6)):
    return {"glb": export_glb(root_name), "shadow": bake_shadow(root_name, shadow_size)}
