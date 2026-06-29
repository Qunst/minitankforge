import math
import os

import bpy
from mathutils import Vector


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, "models", "jagdpanther-ii")
BLEND_PATH = os.path.join(OUT_DIR, "jagdpanther-ii-1-200.blend")
STL_PATH = os.path.join(OUT_DIR, "jagdpanther-ii-1-200.stl")
PREVIEW_PATH = os.path.join(OUT_DIR, "jagdpanther-ii-1-200-preview.png")


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 0.001


def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    return mat


def apply_bevel(obj, amount=0.08, segments=1):
    if amount <= 0:
        return obj
    bevel = obj.modifiers.new("print_softened_edges", "BEVEL")
    bevel.width = amount
    bevel.segments = segments
    bevel.affect = "EDGES"
    obj.modifiers.new("weighted_print_normals", "WEIGHTED_NORMAL")
    return obj


def cube(name, loc, dims, mat=None, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    return apply_bevel(obj, bevel)


def cylinder_x(name, loc, radius, length, mat=None, vertices=32, bevel=False):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=length,
        end_fill_type="NGON",
        location=loc,
        rotation=(0, math.pi / 2, 0),
    )
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if bevel:
        apply_bevel(obj, 0.03, 1)
    return obj


def cylinder_y(name, loc, radius, depth, mat=None, vertices=28, bevel=False):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        end_fill_type="NGON",
        location=loc,
        rotation=(math.pi / 2, 0, 0),
    )
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if bevel:
        apply_bevel(obj, 0.025, 1)
    return obj


def cylinder_z(name, loc, radius, depth, mat=None, vertices=28, bevel=False):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        end_fill_type="NGON",
        location=loc,
    )
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if bevel:
        apply_bevel(obj, 0.025, 1)
    return obj


def cone_x(name, loc, radius1, radius2, length, mat=None, vertices=32):
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius1,
        radius2=radius2,
        depth=length,
        end_fill_type="NGON",
        location=loc,
        rotation=(0, math.pi / 2, 0),
    )
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    obj.modifiers.new("weighted_print_normals", "WEIGHTED_NORMAL")
    return obj


def sloped_box(name, xb0, xf0, xb1, xf1, y0, y1, z0, z1, mat=None, bevel=0.0):
    verts = [
        (xb0, -y0, z0),
        (xf0, -y0, z0),
        (xf0, y0, z0),
        (xb0, y0, z0),
        (xb1, -y1, z1),
        (xf1, -y1, z1),
        (xf1, y1, z1),
        (xb1, y1, z1),
    ]
    faces = [
        (0, 1, 2, 3),
        (4, 7, 6, 5),
        (0, 4, 5, 1),
        (1, 5, 6, 2),
        (2, 6, 7, 3),
        (3, 7, 4, 0),
    ]
    mesh = bpy.data.meshes.new(f"{name}Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return apply_bevel(obj, bevel)


def add_track_run(side, dark, rubber, steel):
    y = side * 8.05
    outer_y = side * 8.58
    cube(f"track_loop_{side}", (0, y, 2.75), (31.6, 1.15, 4.9), rubber, 0.12)
    cube(f"track_inner_shadow_{side}", (0, side * 8.64, 2.75), (28.5, 0.28, 3.7), dark, 0.06)

    for idx, x in enumerate([ -13.5, 13.5 ]):
        cylinder_y(f"sprocket_idler_{side}_{idx}", (x, outer_y, 2.75), 1.75, 0.55, steel, 36, True)
        cylinder_y(f"sprocket_hub_{side}_{idx}", (x, outer_y + side * 0.03, 2.75), 0.75, 0.62, dark, 28, True)

    for i, x in enumerate([-10.5, -6.3, -2.1, 2.1, 6.3, 10.5]):
        cylinder_y(f"road_wheel_{side}_{i}", (x, outer_y, 2.15), 1.32, 0.62, steel, 36, True)
        cylinder_y(f"road_wheel_hub_{side}_{i}", (x, outer_y + side * 0.04, 2.15), 0.53, 0.70, dark, 28, True)

    for i, x in enumerate([-8.4, -4.2, 0, 4.2, 8.4]):
        cylinder_y(f"return_roller_{side}_{i}", (x, outer_y, 4.38), 0.45, 0.55, steel, 24, True)

    for i in range(28):
        x = -14.7 + i * 1.09
        cube(f"bottom_track_pad_{side}_{i}", (x, outer_y, 0.36), (0.72, 0.55, 0.32), dark, 0.025)
        cube(f"top_track_pad_{side}_{i}", (x, outer_y, 5.12), (0.72, 0.48, 0.30), dark, 0.025)

    for i in range(8):
        z = 0.9 + i * 0.52
        cube(f"front_track_face_{side}_{i}", (15.52, outer_y, z), (0.32, 0.52, 0.31), dark, 0.02)
        cube(f"rear_track_face_{side}_{i}", (-15.52, outer_y, z), (0.32, 0.52, 0.31), dark, 0.02)


def add_top_details(green, dark, steel):
    # Engine deck and casemate roof details are intentionally chunky for 1:200 resin printing.
    for x, y, r in [(-10.5, -3.2, 0.72), (-7.8, 2.7, 0.62), (-3.6, -2.2, 0.55), (1.2, 2.8, 0.52)]:
        cylinder_z("round_hatch", (x, y, 13.35), r, 0.22, green, 28, True)

    for x in [-11.2, -8.7, -6.2]:
        cube("rear_engine_grille", (x, -5.1, 13.42), (1.45, 0.72, 0.18), dark, 0.035)
        cube("rear_engine_grille", (x, 5.1, 13.42), (1.45, 0.72, 0.18), dark, 0.035)

    for x in [-6.8, -4.7, -2.6, -0.5, 1.6]:
        cylinder_z("roof_bolt", (x, -6.0, 13.5), 0.16, 0.15, steel, 14, False)
        cylinder_z("roof_bolt", (x, 6.0, 13.5), 0.16, 0.15, steel, 14, False)

    cylinder_z("commander_cupola", (-6.2, 1.5, 14.05), 0.78, 0.55, green, 32, True)
    cylinder_z("cupola_lid", (-6.2, 1.5, 14.43), 0.62, 0.24, green, 32, True)
    cube("rear_rect_hatch", (-10.1, 0.0, 13.65), (1.6, 1.15, 0.24), green, 0.06)

    # Front deck fixtures and hatches.
    cube("driver_hatch", (8.9, -3.1, 6.55), (1.7, 1.05, 0.22), green, 0.06)
    cube("radio_hatch", (8.9, 3.1, 6.55), (1.7, 1.05, 0.22), green, 0.06)
    cylinder_z("front_round_cover", (12.0, 0.0, 6.45), 0.62, 0.20, green, 24, True)
    cube("front_travel_lock", (13.5, 0.0, 6.75), (0.38, 1.45, 0.56), dark, 0.04)

    # Side tools and tow cables.
    for side in [-1, 1]:
        y = side * 7.86
        cube(f"side_tool_box_{side}", (-6.8, y, 6.95), (3.1, 0.34, 0.42), green, 0.04)
        cylinder_x(f"side_tow_cable_{side}", (-0.8, y, 7.13), 0.11, 13.8, steel, 12, False)
        cube(f"side_stowage_box_{side}", (-11.5, y, 8.8), (1.7, 0.42, 0.8), green, 0.05)

        for i, x in enumerate([-12.5, -11.55, -10.6, -9.65]):
            cube(f"spare_track_link_{side}_{i}", (x, y + side * 0.08, 10.4), (0.58, 0.38, 0.72), dark, 0.025)

        for i, x in enumerate([-3.2, -1.95, -0.7, 0.55, 1.8, 3.05]):
            cylinder_y(f"casemate_side_bolt_{side}_{i}", (x, side * 6.31, 9.9), 0.13, 0.12, steel, 12, False)


def add_gun(green, dark, steel):
    # 12.8 cm PaK 80/L55 style long barrel, scaled as a sturdy miniature part.
    cone_x("gun_mantlet_taper", (8.25, 0, 8.95), 0.95, 0.55, 3.0, green, 32)
    cylinder_x("gun_sleeve", (10.45, 0, 8.95), 0.62, 1.65, green, 32, True)
    cylinder_x("main_barrel_reinforced", (16.8, 0, 8.95), 0.34, 11.3, steel, 32, True)
    cylinder_x("main_barrel_front", (22.6, 0, 8.95), 0.28, 3.1, steel, 28, True)
    cylinder_x("muzzle_band", (24.35, 0, 8.95), 0.43, 0.42, steel, 28, True)
    cylinder_x("muzzle_tip", (24.78, 0, 8.95), 0.34, 0.45, steel, 28, True)

    cube("mantlet_lower_cheek", (7.55, 0, 8.25), (1.35, 2.85, 0.42), green, 0.08)
    cube("mantlet_top_cheek", (7.55, 0, 9.73), (1.25, 2.65, 0.32), green, 0.08)
    cylinder_x("coaxial_hint", (8.85, -1.18, 8.52), 0.12, 0.65, dark, 12, False)


def add_exhausts_and_rear(green, dark, steel):
    cube("rear_plate_detail", (-16.0, 0, 7.7), (0.34, 11.8, 2.2), green, 0.08)
    for y in [-4.4, 4.4]:
        cylinder_x("rear_exhaust_can", (-16.32, y, 6.0), 0.42, 0.48, dark, 18, True)
        cylinder_x("rear_exhaust_pipe", (-16.58, y, 7.05), 0.13, 0.82, steel, 12, False)
    for y in [-2.2, 2.2]:
        cube("rear_stowage_block", (-16.35, y, 9.2), (0.45, 1.25, 0.9), green, 0.05)


def create_model():
    reset_scene()
    os.makedirs(OUT_DIR, exist_ok=True)

    green = material("base_coat_field_green", (0.33, 0.42, 0.28, 1))
    dark = material("track_dark", (0.055, 0.052, 0.047, 1))
    steel = material("aged_steel", (0.45, 0.44, 0.40, 1))

    # Dimensions are in millimeters and target roughly 1:200:
    # hull length about 33 mm, width about 17 mm, casemate height about 14 mm.
    sloped_box("lower_panther_hull", -15.9, 15.9, -14.7, 14.7, 7.5, 7.95, 2.65, 6.1, green, 0.10)
    sloped_box("front_glacis", 4.9, 15.7, 3.3, 14.6, 7.7, 7.15, 5.65, 6.75, green, 0.08)
    sloped_box("jagdpanther_ii_casemate", -14.0, 8.4, -11.8, 3.65, 7.25, 6.15, 6.0, 13.25, green, 0.10)
    cube("left_side_skirt", (0.0, -7.88, 5.45), (30.6, 0.42, 1.95), green, 0.06)
    cube("right_side_skirt", (0.0, 7.88, 5.45), (30.6, 0.42, 1.95), green, 0.06)

    # Front fenders and rear overhang hint.
    cube("front_left_fender", (13.8, -7.25, 5.1), (3.2, 1.25, 0.32), green, 0.04)
    cube("front_right_fender", (13.8, 7.25, 5.1), (3.2, 1.25, 0.32), green, 0.04)
    cube("rear_fender_bar", (-14.2, 0, 5.2), (2.7, 15.2, 0.32), green, 0.04)

    for side in [-1, 1]:
        add_track_run(side, dark, dark, green)

    add_gun(green, dark, steel)
    add_top_details(green, dark, steel)
    add_exhausts_and_rear(green, dark, steel)

    # Small lifting loops as printable raised blocks rather than fragile wire.
    for x, y in [(-12.8, -4.8), (-12.8, 4.8), (3.8, -4.6), (3.8, 4.6), (12.9, -5.3), (12.9, 5.3)]:
        cube("lifting_loop_hint", (x, y, 6.85 if x > 6 else 13.55), (0.42, 0.18, 0.36), dark, 0.03)

    # A tiny base datum is useful for checking print orientation, but it is left separate and hidden.
    datum = cube("hidden_dimension_datum_33mm_hull", (0, 0, -0.25), (33.0, 17.0, 0.08), steel, 0.0)
    datum.hide_render = True
    datum.hide_viewport = True

    # Camera and lighting for quick visual QA.
    bpy.ops.object.light_add(type="AREA", location=(8, -24, 34))
    bpy.context.object.name = "large_softbox"
    bpy.context.object.data.energy = 1100
    bpy.context.object.data.size = 24
    bpy.ops.object.light_add(type="SUN", location=(-10, 10, 30))
    bpy.context.object.name = "shape_read_sun"
    bpy.context.object.data.energy = 1.6

    bpy.ops.object.camera_add(location=(46, -54, 28))
    camera = bpy.context.object
    camera.name = "preview_camera"
    target = Vector((2.5, 0.0, 6.8))
    direction = target - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 45
    bpy.context.scene.camera = camera
    bpy.context.scene.render.resolution_x = 1600
    bpy.context.scene.render.resolution_y = 1000
    bpy.context.scene.world.color = (0.78, 0.80, 0.82)
    bpy.context.scene.view_settings.view_transform = "Standard"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.eevee.taa_render_samples = 64

    return BLEND_PATH, STL_PATH, PREVIEW_PATH


def export_outputs():
    blend_path, stl_path, preview_path = create_model()
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)

    for obj in bpy.context.scene.objects:
        obj.select_set(not obj.hide_viewport)
    bpy.context.view_layer.objects.active = next(obj for obj in bpy.context.scene.objects if obj.select_get())

    try:
        bpy.ops.wm.stl_export(filepath=stl_path, export_selected_objects=True, apply_modifiers=True)
    except Exception:
        bpy.ops.export_mesh.stl(filepath=stl_path, use_selection=True, use_mesh_modifiers=True)

    bpy.context.scene.render.filepath = preview_path
    bpy.ops.render.render(write_still=True)
    print(f"Saved {blend_path}")
    print(f"Saved {stl_path}")
    print(f"Saved {preview_path}")


if __name__ == "__main__":
    export_outputs()
