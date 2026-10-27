import json
import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSET_ROOT = os.path.join(os.path.dirname(ROOT), "minitankforge unpushed", "stls")
OUT_DIR = os.path.join(ASSET_ROOT, "object-490b-belka-1-200")
BLEND_PATH = os.path.join(OUT_DIR, "object-490b-belka-1-200.blend")
HULL_STL_PATH = os.path.join(OUT_DIR, "object-490b-belka-1-200-hull.stl")
TURRET_STL_PATH = os.path.join(OUT_DIR, "object-490b-belka-1-200-turret.stl")
PREVIEW_PATH = os.path.join(OUT_DIR, "object-490b-belka-1-200-preview.png")
SIDE_PATH = os.path.join(OUT_DIR, "object-490b-belka-1-200-side.png")
TOP_PATH = os.path.join(OUT_DIR, "object-490b-belka-1-200-top.png")
REPORT_PATH = os.path.join(OUT_DIR, "object-490b-belka-1-200-report.json")

SCALE = "1:200"
VOXEL_SIZE = 0.10
SOCKET_RADIUS = 1.82
PEG_RADIUS = 1.52
PEG_LENGTH = 1.75


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "MILLIMETERS"
    scene.unit_settings.scale_length = 0.001


def material(name, rgba, metallic=0.0, roughness=0.7):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = rgba
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = rgba
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return mat


def assign_material(obj, mat):
    if mat is not None:
        obj.data.materials.append(mat)
    return obj


def apply_bevel(obj, width=0.08, segments=2):
    if width <= 0:
        return obj
    bevel = obj.modifiers.new("print_edge_softening", "BEVEL")
    bevel.width = width
    bevel.segments = segments
    bevel.limit_method = "ANGLE"
    bevel.angle_limit = math.radians(20)
    return obj


def box(name, location, dimensions, mat=None, bevel=0.0, rotation=(0.0, 0.0, 0.0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_material(obj, mat)
    return apply_bevel(obj, bevel)


def cylinder(name, location, radius, depth, axis="Z", mat=None, vertices=32, rotation=None, bevel=0.0):
    if rotation is None:
        if axis == "X":
            rotation = (0.0, math.pi / 2.0, 0.0)
        elif axis == "Y":
            rotation = (math.pi / 2.0, 0.0, 0.0)
        else:
            rotation = (0.0, 0.0, 0.0)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        end_fill_type="NGON",
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    assign_material(obj, mat)
    return apply_bevel(obj, bevel)


def cone(name, location, radius1, radius2, depth, axis="X", mat=None, vertices=32, rotation=None):
    if rotation is None:
        rotation = (0.0, math.pi / 2.0, 0.0) if axis == "X" else (0.0, 0.0, 0.0)
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        end_fill_type="NGON",
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    assign_material(obj, mat)
    return obj


def cylinder_between(name, start, end, radius, mat=None, vertices=20, bevel=0.0):
    start_v = Vector(start)
    end_v = Vector(end)
    direction = end_v - start_v
    midpoint = (start_v + end_v) * 0.5
    obj = cylinder(name, midpoint, radius, direction.length, axis="Z", mat=mat, vertices=vertices, bevel=bevel)
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    return obj


def mesh_object(name, verts, faces, mat=None, bevel=0.0):
    mesh = bpy.data.meshes.new(f"{name}_mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    assign_material(obj, mat)
    return apply_bevel(obj, bevel)


def lofted_hull(name, sections, mat=None, bevel=0.0):
    """Build a closed hull from x stations: (x, bottom_z, bottom_half_width, top_z, top_half_width)."""
    verts = []
    for x, bottom_z, bottom_half, top_z, top_half in sections:
        verts.extend(
            [
                (x, -bottom_half, bottom_z),
                (x, bottom_half, bottom_z),
                (x, -top_half, top_z),
                (x, top_half, top_z),
            ]
        )

    faces = []
    for i in range(len(sections) - 1):
        a = i * 4
        b = (i + 1) * 4
        faces.extend(
            [
                (a, b, b + 1, a + 1),
                (a + 2, a + 3, b + 3, b + 2),
                (a, a + 2, b + 2, b),
                (a + 1, b + 1, b + 3, a + 3),
            ]
        )
    faces.append((0, 1, 3, 2))
    last = (len(sections) - 1) * 4
    faces.append((last, last + 2, last + 3, last + 1))
    return mesh_object(name, verts, faces, mat, bevel)


def wedge_box(name, x0, x1, lower_z, upper_z0, upper_z1, lower_half_width, upper_half_width, mat=None, bevel=0.0):
    sections = [
        (x0, lower_z, lower_half_width, upper_z0, upper_half_width),
        (x1, lower_z, lower_half_width, upper_z1, upper_half_width),
    ]
    return lofted_hull(name, sections, mat, bevel)


def add_track_pod(parts, side, x_center, length, wheel_xs, green, track, steel, pod_label):
    y_center = side * 8.82
    y_outer = side * 9.58
    # A solid, rounded track mass guarantees printable continuity; raised pads and wheels carry the detail.
    pod = box(
        f"{pod_label}_track_core_{side}",
        (x_center, y_center, 2.08),
        (length, 1.55, 3.45),
        track,
        0.48,
    )
    parts.append(pod)

    wheel_radius = 1.40
    for i, x in enumerate(wheel_xs):
        wheel = cylinder(
            f"{pod_label}_roadwheel_{side}_{i}",
            (x, y_outer, 1.92),
            wheel_radius,
            0.58,
            axis="Y",
            mat=green,
            vertices=28,
            bevel=0.06,
        )
        hub = cylinder(
            f"{pod_label}_hub_{side}_{i}",
            (x, y_outer + side * 0.11, 1.92),
            0.48,
            0.66,
            axis="Y",
            mat=steel,
            vertices=20,
            bevel=0.04,
        )
        parts.extend([wheel, hub])

    end_offset = length * 0.5 - 1.28
    for suffix, x in (("rear", x_center - end_offset), ("front", x_center + end_offset)):
        sprocket = cylinder(
            f"{pod_label}_{suffix}_sprocket_{side}",
            (x, y_outer + side * 0.03, 2.12),
            1.56,
            0.65,
            axis="Y",
            mat=green,
            vertices=32,
            bevel=0.05,
        )
        sprocket_hub = cylinder(
            f"{pod_label}_{suffix}_sprocket_hub_{side}",
            (x, y_outer + side * 0.16, 2.12),
            0.60,
            0.72,
            axis="Y",
            mat=steel,
            vertices=20,
            bevel=0.04,
        )
        parts.extend([sprocket, sprocket_hub])

    tread_count = max(7, int(length / 1.55))
    for i in range(tread_count):
        x = x_center - length * 0.5 + 0.75 + i * ((length - 1.5) / max(1, tread_count - 1))
        for z, top in ((0.27, False), (3.91, True)):
            pad = box(
                f"{pod_label}_{'top' if top else 'bottom'}_pad_{side}_{i}",
                (x, y_center + side * 0.02, z),
                (0.72, 1.72, 0.34),
                track,
                0.04,
            )
            parts.append(pad)

    # Side tread chevrons keep the four independent loops legible after painting.
    for i in range(tread_count - 1):
        x = x_center - length * 0.5 + 1.2 + i * ((length - 2.4) / max(1, tread_count - 2))
        chevron = box(
            f"{pod_label}_outer_tread_{side}_{i}",
            (x, y_outer + side * 0.27, 3.43),
            (0.58, 0.33, 0.38),
            track,
            0.04,
            rotation=(0.0, math.radians(18 if i % 2 == 0 else -18), 0.0),
        )
        parts.append(chevron)


def join_and_voxelize(parts, name, voxel_size=VOXEL_SIZE):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = name
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    obj.data.remesh_voxel_size = voxel_size
    obj.data.remesh_voxel_adaptivity = 0.0
    bpy.ops.object.voxel_remesh()
    obj.name = name
    # A light decimation removes voxel stair-stepping without erasing 0.5 mm surface details.
    decimate = obj.modifiers.new("print_mesh_cleanup", "DECIMATE")
    decimate.decimate_type = "DISSOLVE"
    decimate.angle_limit = math.radians(2.0)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=decimate.name)
    return obj


def boolean_difference(target, cutter):
    bpy.context.view_layer.objects.active = target
    target.select_set(True)
    cutter.select_set(False)
    modifier = target.modifiers.new("turret_socket", "BOOLEAN")
    modifier.operation = "DIFFERENCE"
    modifier.solver = "EXACT"
    modifier.object = cutter
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    bpy.data.objects.remove(cutter, do_unlink=True)


def build_hull(green, track, steel, dark):
    parts = []
    lower = lofted_hull(
        "lower_armored_hull",
        [
            (-21.0, 1.15, 6.85, 4.15, 7.70),
            (-15.0, 1.15, 7.60, 4.55, 8.00),
            (0.0, 1.15, 7.95, 4.65, 8.10),
            (14.0, 1.15, 7.70, 4.25, 7.70),
            (21.0, 1.15, 6.75, 3.15, 6.95),
        ],
        green,
        0.12,
    )
    upper = lofted_hull(
        "belka_wedge_upper_hull",
        [
            (-20.3, 4.00, 7.25, 7.72, 6.15),
            (-15.8, 4.25, 7.60, 8.55, 6.55),
            (-7.0, 4.40, 7.85, 8.20, 6.75),
            (4.0, 4.45, 7.85, 7.60, 6.55),
            (13.2, 4.05, 7.45, 5.62, 6.70),
            (20.5, 3.05, 6.80, 3.60, 5.65),
        ],
        green,
        0.10,
    )
    parts.extend([lower, upper])

    # Four independent track loops, the most characteristic Belka feature.
    for side in (-1, 1):
        add_track_pod(parts, side, -10.55, 19.15, [-17.0, -12.7, -8.4, -4.1], green, track, steel, "rear")
        add_track_pod(parts, side, 11.35, 16.65, [6.7, 11.35, 16.0], green, track, steel, "front")
        side_skirt = wedge_box(
            f"upper_track_skirt_{side}",
            -20.1,
            20.25,
            3.45,
            5.35,
            4.15,
            0.30,
            0.36,
            green,
            0.06,
        )
        side_skirt.location.y = side * 8.13
        parts.append(side_skirt)

        # Division armor over the gap between front and rear track groups.
        divider = box(
            f"track_divider_{side}",
            (1.25, side * 8.64, 2.72),
            (1.18, 1.10, 3.72),
            green,
            0.10,
        )
        parts.append(divider)

    # Nose ribs and towing eyes are intentionally stout for resin handling.
    for y in (-4.85, 4.85):
        tow_eye = cylinder(
            f"front_tow_eye_{y}",
            (20.35, y, 2.83),
            0.48,
            0.68,
            axis="Y",
            mat=steel,
            vertices=20,
            bevel=0.05,
        )
        parts.append(tow_eye)

    # Engine and cooling deck relief.
    for x in (-5.2, -2.9, -0.6):
        for y in (-3.9, 3.9):
            grille = box(
                "engine_deck_grille",
                (x, y, 8.31),
                (1.55, 1.22, 0.26),
                dark,
                0.05,
                rotation=(0.0, math.radians(-3.0), 0.0),
            )
            parts.append(grille)

    # Rear two-person crew capsule: paired hatches and periscopes.
    for y in (-2.18, 2.18):
        hatch = box(
            "crew_hatch",
            (-14.75, y, 8.75),
            (3.05, 2.55, 0.28),
            green,
            0.18,
            rotation=(0.0, math.radians(5.0), 0.0),
        )
        periscope = box(
            "crew_periscope",
            (-12.95, y, 8.94),
            (0.80, 1.05, 0.36),
            dark,
            0.08,
            rotation=(0.0, math.radians(5.0), 0.0),
        )
        parts.extend([hatch, periscope])

    rear_camera = box("rear_camera", (-20.16, 0.0, 7.18), (0.62, 1.12, 0.78), dark, 0.10)
    parts.append(rear_camera)

    # The rear crew compartment has two conspicuous circular escape-hatch covers.
    for y in (-2.25, 2.25):
        rear_hatch = cylinder(
            "rear_crew_escape_hatch",
            (-20.22, y, 6.45),
            1.05,
            0.48,
            axis="X",
            mat=green,
            vertices=32,
            bevel=0.06,
        )
        parts.append(rear_hatch)

    # Raised rear observation/defensive station visible on the surviving model references.
    station_base = cylinder("rear_station_ring", (-15.25, 0.0, 8.72), 2.22, 0.46, "Z", green, 40, bevel=0.08)
    station_body = box("rear_station_body", (-15.25, 0.0, 9.48), (4.25, 3.75, 1.45), green, 0.16)
    station_roof = box("rear_station_roof", (-15.48, 0.0, 10.27), (3.75, 3.35, 0.30), green, 0.10)
    station_gun = cylinder("rear_station_weapon", (-10.85, 0.0, 9.78), 0.24, 5.35, "X", dark, 16, bevel=0.02)
    parts.extend([station_base, station_body, station_roof, station_gun])
    for y in (-1.18, 0.0, 1.18):
        optic = box("rear_station_optic", (-13.02, y, 9.56), (0.42, 0.72, 0.54), dark, 0.06)
        parts.append(optic)

    for y in (-5.25, 5.25):
        round_deck_hatch = cylinder("round_deck_hatch", (-8.55, y, 8.31), 0.78, 0.28, "Z", green, 28, bevel=0.05)
        parts.append(round_deck_hatch)

    # Armored access panels and raised seams give the broad wedge readable scale.
    for x, y, sx, sy, tilt in [
        (9.8, -3.2, 4.4, 2.3, -12.0),
        (9.8, 3.2, 4.4, 2.3, -12.0),
        (-9.0, 0.0, 3.5, 3.2, 2.0),
    ]:
        panel = box(
            "armored_deck_panel",
            (x, y, 7.05 if x > 0 else 8.54),
            (sx, sy, 0.22),
            green,
            0.08,
            rotation=(0.0, math.radians(tilt), 0.0),
        )
        parts.append(panel)

    # Low exhaust outlets on both rear quarters.
    for y in (-6.15, 6.15):
        outlet = cylinder_between(
            "rear_exhaust",
            (-19.3, y, 5.25),
            (-20.85, y, 5.55),
            0.33,
            dark,
            16,
            0.03,
        )
        parts.append(outlet)

    hull = join_and_voxelize(parts, "Belka_Hull_Watertight")

    # Deep blind socket. It remains closed at the bottom and therefore watertight.
    socket_x = 3.65
    socket_top = 8.05
    cutter = cylinder(
        "turret_socket_cutter",
        (socket_x, 0.0, socket_top - 1.25),
        SOCKET_RADIUS,
        2.70,
        axis="Z",
        vertices=64,
    )
    boolean_difference(hull, cutter)
    return hull, socket_x, socket_top


def build_turret(green, steel, dark, socket_x, socket_top):
    parts = []
    turret_z = socket_top + 0.34
    turret_body = lofted_hull(
        "low_profile_unmanned_turret",
        [
            (-1.25, turret_z, 3.55, turret_z + 2.15, 2.42),
            (2.15, turret_z, 4.02, turret_z + 2.62, 2.95),
            (6.80, turret_z, 3.38, turret_z + 1.85, 2.28),
            (8.00, turret_z, 2.35, turret_z + 1.05, 1.55),
        ],
        green,
        0.10,
    )
    parts.append(turret_body)

    # Turntable collar and print-fit peg.
    collar = cylinder("turret_turntable", (socket_x, 0.0, turret_z + 0.06), 3.55, 0.56, "Z", green, 56, bevel=0.08)
    peg = cylinder(
        "turret_rotation_peg",
        (socket_x, 0.0, socket_top - PEG_LENGTH * 0.5 + 0.08),
        PEG_RADIUS,
        PEG_LENGTH,
        "Z",
        green,
        48,
        bevel=0.06,
    )
    parts.extend([collar, peg])

    # 152 mm gun, thickened to 1.0 mm at 1:200 so it survives washing and play.
    gun_z = turret_z + 1.93
    mantlet = cone("152mm_mantlet", (8.05, 0.0, gun_z), 1.08, 0.66, 2.35, "X", green, 36)
    sleeve = cylinder("gun_sleeve", (9.70, 0.0, gun_z), 0.66, 1.55, "X", green, 32, bevel=0.05)
    barrel = cone("152mm_barrel", (23.05, 0.0, gun_z + 0.18), 0.54, 0.43, 25.60, "X", steel, 32)
    muzzle = cylinder("muzzle_band", (36.20, 0.0, gun_z + 0.35), 0.58, 0.72, "X", steel, 32, bevel=0.05)
    parts.extend([mantlet, sleeve, barrel, muzzle])

    # Sighting head and coaxial weapon block.
    sight = box("armored_sight_head", (4.25, -2.62, turret_z + 2.66), (1.28, 1.12, 1.35), dark, 0.13)
    sight_lens = box("sight_lens", (4.70, -3.12, turret_z + 2.75), (0.56, 0.30, 0.62), steel, 0.05)
    coax = cylinder("coaxial_weapon", (8.35, -1.16, gun_z - 0.48), 0.20, 1.52, "X", dark, 16, bevel=0.02)
    parts.extend([sight, sight_lens, coax])

    # Four launch tubes per side, fused to armored banks for print reliability.
    for side in (-1, 1):
        bank = box(
            f"smoke_launcher_bank_{side}",
            (2.35, side * 3.16, turret_z + 1.45),
            (3.15, 0.58, 0.72),
            green,
            0.09,
            rotation=(0.0, 0.0, math.radians(side * 8.0)),
        )
        parts.append(bank)
        for i in range(4):
            x = 1.15 + i * 0.77
            start = (x, side * 3.17, turret_z + 1.54)
            end = (x + 0.20, side * 3.76, turret_z + 1.88)
            tube = cylinder_between(f"smoke_tube_{side}_{i}", start, end, 0.24, dark, 14, 0.02)
            parts.append(tube)

    # Roof service cover and lifting lugs.
    roof_cover = box("turret_service_cover", (2.55, 0.0, turret_z + 2.72), (2.35, 2.05, 0.24), green, 0.12)
    parts.append(roof_cover)
    for x, y in ((0.25, -2.35), (0.25, 2.35), (5.55, -2.18), (5.55, 2.18)):
        lug = box("turret_lifting_lug", (x, y, turret_z + 2.08), (0.48, 0.34, 0.46), steel, 0.05)
        parts.append(lug)

    turret = join_and_voxelize(parts, "Belka_Turret_Watertight", 0.085)
    return turret


def mesh_report(obj):
    mesh = obj.data
    mesh.calc_loop_triangles()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    boundary_edges = sum(1 for edge in bm.edges if not edge.is_manifold)
    bm.free()
    dimensions = [round(value, 3) for value in obj.dimensions]
    return {
        "name": obj.name,
        "vertices": len(mesh.vertices),
        "triangles": len(mesh.loop_triangles),
        "non_manifold_edges": boundary_edges,
        "dimensions_mm": {"x": dimensions[0], "y": dimensions[1], "z": dimensions[2]},
    }


def export_stl(obj, path, drop_to_zero=False):
    original_location = obj.location.copy()
    if drop_to_zero:
        world_min_z = min((obj.matrix_world @ vertex.co).z for vertex in obj.data.vertices)
        obj.location.z -= world_min_z
        bpy.context.view_layer.update()
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.wm.stl_export(filepath=path, export_selected_objects=True, apply_modifiers=True, ascii_format=False)
    except Exception:
        bpy.ops.export_mesh.stl(filepath=path, use_selection=True, use_mesh_modifiers=True, ascii=False)
    obj.location = original_location
    bpy.context.view_layer.update()


def point_camera(camera, location, target, ortho_scale):
    camera.location = location
    direction = Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    camera.data.ortho_scale = ortho_scale


def setup_render(green):
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1800
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.world.color = (0.34, 0.37, 0.40)
    scene.view_settings.look = "AgX - Medium Low Contrast"
    scene.view_settings.exposure = 1.15

    ground = box("preview_ground", (1.5, 0.0, -0.55), (67.0, 39.0, 0.8), green, 0.4)
    ground.data.materials.clear()
    ground_mat = material("preview_ground_material", (0.28, 0.30, 0.32, 1.0), 0.0, 0.9)
    ground.data.materials.append(ground_mat)

    bpy.ops.object.light_add(type="AREA", location=(16.0, -27.0, 34.0))
    key = bpy.context.object
    key.name = "large_softbox"
    key.data.energy = 2200
    key.data.shape = "DISK"
    key.data.size = 22.0
    bpy.ops.object.light_add(type="AREA", location=(-22.0, 18.0, 20.0))
    fill = bpy.context.object
    fill.name = "fill_light"
    fill.data.energy = 1400
    fill.data.size = 16.0
    bpy.ops.object.light_add(type="AREA", location=(-12.0, -8.0, 28.0))
    rim = bpy.context.object
    rim.name = "rim_light"
    rim.data.energy = 1200
    rim.data.size = 10.0
    bpy.ops.object.light_add(type="SUN", location=(0.0, 0.0, 24.0))
    sun = bpy.context.object
    sun.name = "preview_sun"
    sun.rotation_euler = (math.radians(28.0), math.radians(-18.0), math.radians(-32.0))
    sun.data.energy = 2.2

    bpy.ops.object.camera_add()
    camera = bpy.context.object
    camera.name = "preview_camera"
    camera.data.type = "ORTHO"
    camera.data.lens = 55
    scene.camera = camera
    return camera, ground


def render_views(camera):
    scene = bpy.context.scene
    point_camera(camera, (66.0, -72.0, 42.0), (3.0, 0.0, 5.0), 67.0)
    scene.render.filepath = PREVIEW_PATH
    bpy.ops.render.render(write_still=True)

    scene.render.resolution_x = 1800
    scene.render.resolution_y = 900
    point_camera(camera, (7.0, -88.0, 7.0), (7.0, 0.0, 4.7), 78.0)
    scene.render.filepath = SIDE_PATH
    bpy.ops.render.render(write_still=True)

    scene.render.resolution_x = 1800
    scene.render.resolution_y = 900
    point_camera(camera, (7.0, 0.0, 92.0), (7.0, 0.0, 3.8), 78.0)
    scene.render.filepath = TOP_PATH
    bpy.ops.render.render(write_still=True)


def finalize_outputs(hull, turret, green):
    hull_report = mesh_report(hull)
    turret_report = mesh_report(turret)
    export_stl(hull, HULL_STL_PATH, drop_to_zero=True)
    export_stl(turret, TURRET_STL_PATH, drop_to_zero=True)

    camera, _ground = setup_render(green)
    render_views(camera)

    report = {
        "model": "Object 490B Belka",
        "scale": SCALE,
        "intended_process": "resin 3D printing",
        "parts": 2,
        "fit": {
            "socket_diameter_mm": round(SOCKET_RADIUS * 2.0, 2),
            "peg_diameter_mm": round(PEG_RADIUS * 2.0, 2),
            "radial_clearance_mm": round(SOCKET_RADIUS - PEG_RADIUS, 2),
            "peg_length_mm": PEG_LENGTH,
        },
        "print_adjustments": {
            "minimum_exposed_detail_mm": 0.45,
            "gun_barrel_minimum_diameter_mm": 0.86,
            "voxel_union_resolution_mm": VOXEL_SIZE,
        },
        "meshes": {"hull": hull_report, "turret": turret_report},
        "sources": [
            "https://btvt.info/7english/490_eng.htm",
            "https://stalingrad.life/articles/obekt-490b/",
            "https://en.topwar.ru/244242-v-prodolzhenie-o-belke-morozov-i-soavtory-o-neobychnoj-hodovoj-chasti-dlja-boevyh-mashin.html",
            "https://www.1999.co.jp/eng/10900418",
            "https://www.trumpeter-china.com/index.php?a=show&g=home&id=3799&l=en&m=product",
        ],
        "files": {
            "blend": BLEND_PATH,
            "hull_stl": HULL_STL_PATH,
            "turret_stl": TURRET_STL_PATH,
            "preview": PREVIEW_PATH,
            "side": SIDE_PATH,
            "top": TOP_PATH,
        },
    }
    with open(REPORT_PATH, "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
    print(json.dumps(report, indent=2))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    if "--finalize-only" in sys.argv:
        hull = bpy.data.objects.get("Belka_Hull_Watertight")
        turret = bpy.data.objects.get("Belka_Turret_Watertight")
        green = bpy.data.materials.get("soviet_prototype_green")
        if hull is None or turret is None or green is None:
            raise RuntimeError("The saved Belka source does not contain the expected hull, turret, and material.")
        finalize_outputs(hull, turret, green)
        return

    reset_scene()
    green = material("soviet_prototype_green", (0.34, 0.46, 0.24, 1.0), 0.05, 0.72)
    track = material("track_dark", (0.075, 0.072, 0.066, 1.0), 0.35, 0.62)
    steel = material("darkened_steel", (0.25, 0.27, 0.25, 1.0), 0.55, 0.48)
    dark = material("optics_and_recesses", (0.035, 0.045, 0.040, 1.0), 0.15, 0.45)

    hull, socket_x, socket_top = build_hull(green, track, steel, dark)
    turret = build_turret(green, steel, dark, socket_x, socket_top)

    # Save editable source before adding render-only staging.
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    finalize_outputs(hull, turret, green)


if __name__ == "__main__":
    main()
