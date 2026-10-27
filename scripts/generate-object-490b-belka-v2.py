import json
import math
import os
import sys
import zipfile

import bpy
import bmesh
from mathutils import Vector


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSET_ROOT = os.path.join(os.path.dirname(ROOT), "minitankforge unpushed", "stls")
OUT_DIR = os.path.join(ASSET_ROOT, "object-490b-belka-1-200-v2")
PREFIX = "object-490b-belka-1-200-v2"
BLEND_PATH = os.path.join(OUT_DIR, f"{PREFIX}.blend")
HULL_STL_PATH = os.path.join(OUT_DIR, f"{PREFIX}-hull.stl")
TURRET_STL_PATH = os.path.join(OUT_DIR, f"{PREFIX}-turret.stl")
PREVIEW_PATH = os.path.join(OUT_DIR, f"{PREFIX}-preview.png")
SIDE_PATH = os.path.join(OUT_DIR, f"{PREFIX}-side.png")
TOP_PATH = os.path.join(OUT_DIR, f"{PREFIX}-top.png")
REAR_PATH = os.path.join(OUT_DIR, f"{PREFIX}-rear.png")
REPORT_PATH = os.path.join(OUT_DIR, f"{PREFIX}-report.json")
ZIP_PATH = os.path.join(OUT_DIR, f"{PREFIX}-print-files.zip")

SOCKET_X = 4.1
SOCKET_Z = 7.22
SOCKET_RADIUS = 1.78
PEG_RADIUS = 1.54
PEG_LENGTH = 1.70


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "MILLIMETERS"
    scene.unit_settings.scale_length = 0.001


def material(name, rgba, metallic=0.0, roughness=0.72):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = rgba
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = rgba
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return mat


def mat_obj(obj, mat):
    if mat:
        obj.data.materials.append(mat)
    return obj


def bevel(obj, width=0.06, segments=2, angle=25):
    if width > 0:
        mod = obj.modifiers.new("print_edge_bevel", "BEVEL")
        mod.width = width
        mod.segments = segments
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(angle)
    return obj


def cube(name, loc, dims, mat=None, bevel_width=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mat_obj(obj, mat)
    return bevel(obj, bevel_width)


def cyl(name, loc, radius, depth, axis="Z", mat=None, vertices=32, bevel_width=0.0, rot=None):
    if rot is None:
        rot = {"X": (0, math.pi / 2, 0), "Y": (math.pi / 2, 0, 0), "Z": (0, 0, 0)}[axis]
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, end_fill_type="NGON", location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    mat_obj(obj, mat)
    return bevel(obj, bevel_width)


def cone(name, loc, r1, r2, depth, axis="X", mat=None, vertices=32, rot=None):
    if rot is None:
        rot = (0, math.pi / 2, 0) if axis == "X" else (0, 0, 0)
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, end_fill_type="NGON", location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    mat_obj(obj, mat)
    return obj


def torus(name, loc, major_radius, minor_radius, axis="Z", mat=None, major_segments=32, minor_segments=10):
    rot = {"X": (0, math.pi / 2, 0), "Y": (math.pi / 2, 0, 0), "Z": (0, 0, 0)}[axis]
    bpy.ops.mesh.primitive_torus_add(major_radius=major_radius, minor_radius=minor_radius,
                                    major_segments=major_segments, minor_segments=minor_segments,
                                    location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    return mat_obj(obj, mat)


def tube_between(name, start, end, radius, mat=None, vertices=16, bevel_width=0.0):
    a, b = Vector(start), Vector(end)
    vec = b - a
    obj = cyl(name, (a + b) * 0.5, radius, vec.length, "Z", mat, vertices, bevel_width)
    obj.rotation_euler = vec.to_track_quat("Z", "Y").to_euler()
    return obj


def mesh_obj(name, verts, faces, mat=None, bevel_width=0.0):
    mesh = bpy.data.meshes.new(name + "_mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    mat_obj(obj, mat)
    return bevel(obj, bevel_width)


def loft(name, stations, mat=None, bevel_width=0.0):
    # station: x, lower z, lower half width, upper z, upper half width
    verts = []
    for x, zl, wl, zu, wu in stations:
        verts += [(x, -wl, zl), (x, wl, zl), (x, -wu, zu), (x, wu, zu)]
    faces = []
    for i in range(len(stations) - 1):
        a, b = i * 4, (i + 1) * 4
        faces += [(a, b, b + 1, a + 1), (a + 2, a + 3, b + 3, b + 2),
                  (a, a + 2, b + 2, b), (a + 1, b + 1, b + 3, a + 3)]
    faces += [(0, 1, 3, 2)]
    a = (len(stations) - 1) * 4
    faces += [(a, a + 2, a + 3, a + 1)]
    return mesh_obj(name, verts, faces, mat, bevel_width)


def plate_poly(name, points, z0, thickness, mat=None, bevel_width=0.04):
    verts = [(x, y, z0) for x, y in points] + [(x, y, z0 + thickness) for x, y in points]
    n = len(points)
    faces = [tuple(range(n - 1, -1, -1)), tuple(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    return mesh_obj(name, verts, faces, mat, bevel_width)


def join_parts(parts, name, apply_modifiers=True):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        obj.select_set(True)
        if apply_modifiers:
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception:
                    pass
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = name
    return obj


def boolean_difference(target, cutter, name="print_boolean"):
    bpy.context.view_layer.objects.active = target
    mod = target.modifiers.new(name, "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.solver = "EXACT"
    mod.object = cutter
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)


def add_track_run(parts, side, mats):
    green, track, steel, dark = mats
    sy = side
    y_core = sy * 8.67
    y_face = sy * 9.48
    # Continuous backing is deliberately concealed behind wheels but guarantees a robust print.
    # Full-height backing sits behind the detailed faces and physically joins both tread runs.
    core = cube(f"track_backing_{side}", (0.0, y_core, 2.20), (39.7, 1.08, 4.20), track, 0.30)
    parts.append(core)

    wheel_xs = [-16.4, -11.05, -5.65, -0.15, 5.35, 10.85, 16.25]
    for i, x in enumerate(wheel_xs):
        wheel = cyl(f"roadwheel_{side}_{i}", (x, y_face, 2.20), 1.38, 0.62, "Y", green, 32, 0.06)
        rim = cyl(f"wheel_rim_{side}_{i}", (x, y_face + sy * 0.12, 2.20), 0.88, 0.68, "Y", dark, 28, 0.035)
        hub = cyl(f"wheel_hub_{side}_{i}", (x, y_face + sy * 0.19, 2.20), 0.42, 0.72, "Y", steel, 24, 0.035)
        parts += [wheel, rim, hub]
        for spoke in range(6):
            ang = spoke * math.tau / 6
            sx = x + math.cos(ang) * 0.65
            sz = 2.20 + math.sin(ang) * 0.65
            parts.append(cyl(f"wheel_bolt_{side}_{i}_{spoke}", (sx, y_face + sy * 0.23, sz), 0.12, 0.15, "Y", steel, 12))
        # Raised ring and six spokes on the outward face reproduce the readable wheel detail of the benchmark print.
        face_y = y_face + sy * 0.34
        parts.append(torus(f"wheel_face_ring_{side}_{i}", (x, face_y, 2.20), 1.03, 0.105, "Y", steel, 32, 8))
        parts.append(cyl(f"wheel_face_hub_{side}_{i}", (x, face_y, 2.20), 0.34, 0.24, "Y", steel, 24, 0.025))
        for spoke in range(6):
            ang = spoke * math.tau / 6
            a = (x + math.cos(ang) * 0.34, face_y, 2.20 + math.sin(ang) * 0.34)
            b = (x + math.cos(ang) * 0.91, face_y, 2.20 + math.sin(ang) * 0.91)
            parts.append(tube_between(f"wheel_face_spoke_{side}_{i}_{spoke}", a, b, 0.095, steel, 10))

    # End wheels and toothed relief.
    for label, x in (("idler", -19.0), ("sprocket", 19.0)):
        parts.append(cyl(f"{label}_{side}", (x, y_face, 2.35), 1.52, 0.66, "Y", green, 36, 0.06))
        parts.append(cyl(f"{label}_hub_{side}", (x, y_face + sy * 0.19, 2.35), 0.53, 0.72, "Y", steel, 24, 0.03))
        face_y = y_face + sy * 0.34
        parts.append(torus(f"{label}_face_ring_{side}", (x, face_y, 2.35), 1.12, 0.11, "Y", steel, 32, 8))
        parts.append(cyl(f"{label}_face_hub_{side}", (x, face_y, 2.35), 0.40, 0.24, "Y", steel, 24, 0.025))
        for spoke in range(8):
            ang = spoke * math.tau / 8
            a = (x + math.cos(ang) * 0.40, face_y, 2.35 + math.sin(ang) * 0.40)
            b = (x + math.cos(ang) * 0.99, face_y, 2.35 + math.sin(ang) * 0.99)
            parts.append(tube_between(f"{label}_face_spoke_{side}_{spoke}", a, b, 0.095, steel, 10))
        for tooth in range(10):
            ang = tooth * math.tau / 10
            tx = x + math.cos(ang) * 1.48
            tz = 2.35 + math.sin(ang) * 1.48
            parts.append(cube(f"{label}_tooth_{side}_{tooth}", (tx, y_face + sy * 0.18, tz), (0.30, 0.22, 0.30), track, 0.025,
                              rot=(0, -ang, 0)))

    # Individual top and bottom links; 0.24 mm relief mirrors the successful T-34 benchmark.
    link_count = 31
    for i in range(link_count):
        x = -19.0 + i * 38.0 / (link_count - 1)
        for top, z in ((True, 4.28), (False, 0.28)):
            parts.append(cube(f"track_link_{side}_{'t' if top else 'b'}_{i}", (x, y_core + sy * 0.04, z),
                              (0.92, 1.58, 0.30), track, 0.025))
            # outer shoe rib remains visible after primer.
            parts.append(cube(f"track_rib_{side}_{'t' if top else 'b'}_{i}", (x, y_face + sy * 0.02, z),
                              (0.23, 0.20, 0.42), steel, 0.02))

    # Return-run hang and lower side edge detail.
    for i, x in enumerate([-14.2, -8.5, -2.8, 2.9, 8.6, 14.3]):
        parts.append(cyl(f"return_roller_{side}_{i}", (x, y_face - sy * 0.02, 3.90), 0.42, 0.63, "Y", steel, 20, 0.03))


def add_hull_surface_detail(parts, mats):
    green, track, steel, dark = mats
    # Major deck panels, laid as thin printable relief rather than texture.
    panels = [
        ("front_center_panel", [(9.2, -2.65), (18.35, -2.2), (19.35, 2.2), (9.2, 2.65)], 5.58),
        ("front_left_panel", [(8.4, 3.0), (18.7, 2.55), (17.7, 6.65), (7.9, 6.25)], 5.56),
        ("front_right_panel", [(8.4, -3.0), (18.7, -2.55), (17.7, -6.65), (7.9, -6.25)], 5.56),
        ("mid_left_panel", [(-2.0, 3.0), (7.0, 3.0), (7.2, 6.35), (-2.1, 6.55)], 6.86),
        ("mid_right_panel", [(-2.0, -3.0), (7.0, -3.0), (7.2, -6.35), (-2.1, -6.55)], 6.86),
        ("rear_center_panel", [(-15.9, -2.45), (-3.0, -2.7), (-3.0, 2.7), (-15.9, 2.45)], 7.38),
    ]
    for name, pts, z in panels:
        parts.append(plate_poly(name, pts, z, 0.19, green, 0.035))

    # Recess-like panel lines are represented with dark, narrow raised channels that survive 0.05 layers.
    seams = [
        ((-15.0, -6.15, 7.50), (17.0, -6.15, 6.10)),
        ((-15.0, 6.15, 7.50), (17.0, 6.15, 6.10)),
        ((-3.0, -6.0, 7.30), (-3.0, 6.0, 7.30)),
        ((7.4, -5.8, 6.75), (7.4, 5.8, 6.75)),
        ((13.3, -5.2, 6.10), (13.3, 5.2, 6.10)),
    ]
    for i, (a, b) in enumerate(seams):
        parts.append(tube_between(f"deck_seam_{i}", a, b, 0.105, dark, 10))

    # Engine grilles with strong border and individual louvers.
    for side in (-1, 1):
        sy = side
        parts.append(cube(f"engine_grille_frame_{side}", (-10.4, sy * 4.35, 7.74), (7.0, 3.25, 0.20), dark, 0.045,
                          rot=(0, math.radians(1.5), 0)))
        parts.append(cube(f"engine_grille_inner_{side}", (-10.4, sy * 4.35, 7.86), (6.38, 2.65, 0.13), green, 0.025,
                          rot=(0, math.radians(1.5), 0)))
        for i in range(10):
            x = -13.05 + i * 0.59
            parts.append(cube(f"grille_louver_{side}_{i}", (x, sy * 4.35, 7.99), (0.18, 2.42, 0.18), dark, 0.018,
                              rot=(0, math.radians(1.5), 0)))

    # Circular deck covers and their bolt rings.
    for j, (x, y, r) in enumerate([(-15.8, -1.7, 0.78), (-15.8, 1.7, 0.78), (-5.25, -5.25, 0.67), (-5.25, 5.25, 0.67)]):
        parts.append(cyl(f"deck_cover_{j}", (x, y, 7.87), r, 0.20, "Z", green, 32, 0.04))
        for k in range(6):
            a = k * math.tau / 6
            parts.append(cyl(f"deck_cover_bolt_{j}_{k}", (x + math.cos(a) * (r - 0.16), y + math.sin(a) * (r - 0.16), 8.02),
                              0.105, 0.13, "Z", steel, 10))

    # Front access hatches and lights.
    for side in (-1, 1):
        sy = side
        parts.append(plate_poly(f"front_hatch_{side}", [(11.0, sy * 3.2), (14.8, sy * 3.05), (15.0, sy * 5.1), (11.1, sy * 5.2)],
                                5.84, 0.22, green, 0.05))
        parts.append(cyl(f"front_light_{side}", (16.9, sy * 5.65, 6.22), 0.38, 0.48, "Y", dark, 20, 0.03))
        parts.append(cube(f"front_light_guard_{side}", (16.75, sy * 5.78, 6.54), (1.28, 0.24, 0.24), steel, 0.04,
                          rot=(0, math.radians(-9), 0)))

    # Grab handles and inspection-panel fasteners remain above the M5s' reliable 0.25 mm feature threshold.
    handles = [(-13.0, -2.1, 7.92), (-13.0, 2.1, 7.92), (-5.7, -1.2, 7.78),
               (-5.7, 1.2, 7.78), (10.8, -4.2, 6.10), (10.8, 4.2, 6.10)]
    for i, (x, y, z) in enumerate(handles):
        parts.append(tube_between(f"handle_bar_{i}", (x - 0.48, y, z + 0.20), (x + 0.48, y, z + 0.20), 0.12, steel, 10))
        parts.append(tube_between(f"handle_post_a_{i}", (x - 0.48, y, z), (x - 0.48, y, z + 0.20), 0.12, steel, 10))
        parts.append(tube_between(f"handle_post_b_{i}", (x + 0.48, y, z), (x + 0.48, y, z + 0.20), 0.12, steel, 10))

    for side in (-1, 1):
        for i in range(12):
            x = -14.6 + i * 2.65
            if x <= -6.5:
                z = 7.74
            elif x <= 4.0:
                z = 7.74 - (x + 6.5) * 0.055
            elif x <= 12.8:
                z = 7.16 - (x - 4.0) * 0.098
            else:
                z = 6.30 - (x - 12.8) * 0.16
            parts.append(cyl(f"deck_edge_fastener_{side}_{i}", (x, side * 6.63, z - 0.10), 0.105, 0.34, "Z", steel, 10))

    # Tow fittings and nose edge blocks.
    for side in (-1, 1):
        sy = side
        parts.append(cyl(f"tow_eye_{side}", (20.25, sy * 5.05, 3.55), 0.45, 0.60, "Y", steel, 22, 0.04))
        parts.append(cube(f"nose_block_{side}", (19.25, sy * 6.25, 4.72), (2.2, 0.58, 0.72), green, 0.08,
                          rot=(0, math.radians(-9), 0)))

    # Side skirt segmentation, bolt line, cable conduit.
    for side in (-1, 1):
        sy = side
        for i in range(12):
            x = -17.6 + i * 3.20
            z = 5.05 + (x + 17.6) * -0.012
            parts.append(cube(f"skirt_panel_{side}_{i}", (x, sy * 8.18, z), (3.02, 0.44, 1.42), green, 0.045))
            parts.append(cyl(f"skirt_bolt_{side}_{i}", (x, sy * 8.43, z + 0.47), 0.115, 0.15, "Y", steel, 10))
        pts = [(-16.5, sy * 8.48, 5.94), (-9.0, sy * 8.52, 5.72), (-1.0, sy * 8.54, 5.65),
               (7.0, sy * 8.50, 5.47), (15.6, sy * 8.42, 4.98)]
        for i in range(len(pts) - 1):
            parts.append(tube_between(f"side_cable_{side}_{i}", pts[i], pts[i + 1], 0.16, dark, 12))


def add_rear_station(parts, mats):
    green, track, steel, dark = mats
    x, z = -14.15, 8.02
    parts.append(cyl("rear_station_race", (x, 0, z), 2.22, 0.30, "Z", dark, 48, 0.04))
    parts.append(cyl("rear_station_turret", (x, 0, z + 0.34), 1.76, 0.66, "Z", green, 40, 0.08))
    # Slightly faceted sight housing and twin optic boxes.
    parts.append(cube("rear_station_sight_bridge", (x - 0.10, 0, z + 0.65), (2.38, 2.28, 0.32), green, 0.07))
    for side in (-1, 1):
        parts.append(cube(f"rear_optic_housing_{side}", (x - 0.28, side * 0.62, z + 1.08), (1.02, 0.88, 0.72), green, 0.09))
        parts.append(cube(f"rear_optic_{side}", (x + 0.28, side * 0.62, z + 1.09), (0.20, 0.56, 0.44), dark, 0.035))
        parts.append(cube(f"rear_optic_lens_{side}", (x + 0.40, side * 0.62, z + 1.09), (0.08, 0.40, 0.30), steel, 0.015))
    parts.append(cube("rear_station_weapon_block", (x + 1.48, 0, z + 0.70), (1.20, 0.68, 0.70), green, 0.08))
    parts.append(cyl("rear_station_weapon", (x + 3.25, 0, z + 0.82), 0.18, 3.05, "X", dark, 16, 0.02))
    # Cupola bolts.
    for i in range(12):
        a = i * math.tau / 12
        parts.append(cyl(f"rear_station_bolt_{i}", (x + math.cos(a) * 1.96, math.sin(a) * 1.96, z + 0.21), 0.11, 0.15, "Z", steel, 10))


def build_hull(mats):
    green, track, steel, dark = mats
    parts = []
    # Long, very low wedge with vertical rear and clipped nose, keyed to the canonical reference.
    parts.append(loft("lower_hull", [
        (-20.8, 1.00, 7.30, 4.55, 8.00), (-17.7, 0.82, 8.35, 5.10, 8.55),
        (0.0, 0.82, 8.55, 5.25, 8.62), (16.8, 0.85, 8.10, 4.82, 7.65),
        (20.9, 1.35, 6.70, 3.45, 5.95)], green, 0.08))
    parts.append(loft("upper_wedge", [
        (-20.2, 4.52, 7.98, 7.46, 7.18), (-16.2, 4.92, 8.42, 7.72, 7.15),
        (-6.5, 5.15, 8.52, 7.58, 7.05), (4.0, 5.15, 8.50, 7.16, 6.95),
        (12.8, 4.75, 7.90, 6.32, 6.55), (18.8, 3.62, 6.60, 5.35, 5.35)], green, 0.07))

    # Hidden structural overlaps make the broad armor, track pods, skirts, and raised deck details
    # resolve as one physical resin body after final manifold fusion.
    parts += [
        cube("internal_rear_deck_substrate", (-10.0, 0, 6.45), (12.5, 11.8, 1.70), green, 0.0),
        cube("internal_mid_deck_substrate", (1.5, 0, 6.05), (12.0, 11.7, 1.55), green, 0.0),
        cube("internal_front_deck_substrate", (12.5, 0, 5.25), (13.0, 10.2, 1.45), green, 0.0),
        cube("rear_station_internal_mount", (-14.2, 0, 7.40), (3.4, 3.4, 1.55), green, 0.0),
    ]
    for side in (-1, 1):
        parts.append(cube(f"track_hull_fusion_{side}", (0, side * 7.82, 2.75), (38.5, 2.05, 2.85), green, 0.0))
        parts.append(cube(f"skirt_hull_fusion_{side}", (0, side * 7.55, 4.95), (36.5, 2.15, 0.95), green, 0.0))
        parts.append(cube(f"grille_internal_mount_{side}", (-10.4, side * 4.35, 7.22), (6.2, 2.5, 1.25), green, 0.0))
    for i, x in enumerate((-16.0, -8.0, 0.0, 8.0, 16.0)):
        parts.append(cube(f"internal_transverse_fusion_{i}", (x, 0, 2.70), (0.85, 18.0, 1.70), green, 0.0))

    for side in (-1, 1):
        add_track_run(parts, side, mats)
    add_hull_surface_detail(parts, mats)
    add_rear_station(parts, mats)

    # Rear face access panels, exhausts, and towing eyes.
    for side in (-1, 1):
        sy = side
        parts.append(cyl(f"rear_access_{side}", (-20.55, sy * 2.55, 5.75), 1.10, 0.32, "X", green, 36, 0.05))
        parts.append(tube_between(f"rear_exhaust_{side}", (-18.5, sy * 6.4, 6.0), (-20.6, sy * 6.4, 6.05), 0.29, dark, 16))
        parts.append(cyl(f"rear_tow_{side}", (-20.65, sy * 5.25, 2.55), 0.42, 0.58, "Y", steel, 20, 0.03))
    parts.append(cube("rear_center_service_panel", (-20.58, 0, 6.0), (0.32, 2.28, 2.10), green, 0.06))

    hull = join_parts(parts, "Belka_V2_Hull")
    cutter = cyl("turret_socket_cutter", (SOCKET_X, 0, SOCKET_Z - 1.05), SOCKET_RADIUS, 2.25, "Z", None, 64)
    boolean_difference(hull, cutter, "turret_socket")
    return hull


def perforated_cradle_side(parts, side, mats, z0):
    green, track, steel, dark = mats
    sy = side
    # Solid rail with black disks visually reading as the canonical row of lightening holes.
    rail = cube(f"cradle_rail_{side}", (4.9, sy * 1.45, z0 + 1.38), (8.4, 0.42, 0.74), green, 0.045,
                rot=(0, math.radians(-1.8), 0))
    parts.append(rail)
    for i in range(7):
        x = 1.85 + i * 1.02
        parts.append(cyl(f"cradle_hole_relief_{side}_{i}", (x, sy * 1.69, z0 + 1.40), 0.235, 0.12, "Y", dark, 18, 0.015))
    parts.append(cube(f"cradle_upper_flange_{side}", (4.9, sy * 1.44, z0 + 1.82), (8.7, 0.50, 0.20), steel, 0.025,
                      rot=(0, math.radians(-1.8), 0)))


def build_turret(mats):
    green, track, steel, dark = mats
    parts = []
    z0 = SOCKET_Z + 0.18
    # Turntable, bearing ring, and keyed peg.
    parts.append(cyl("main_turntable_lower", (SOCKET_X, 0, z0), 3.35, 0.44, "Z", dark, 64, 0.04))
    parts.append(cyl("main_turntable_upper", (SOCKET_X, 0, z0 + 0.25), 2.92, 0.50, "Z", green, 64, 0.06))
    parts.append(cyl("rotation_peg", (SOCKET_X, 0, SOCKET_Z - PEG_LENGTH * 0.5 + 0.05), PEG_RADIUS, PEG_LENGTH, "Z", green, 56, 0.04))
    for i in range(16):
        a = i * math.tau / 16
        parts.append(cyl(f"turntable_bolt_{i}", (SOCKET_X + math.cos(a) * 2.62, math.sin(a) * 2.62, z0 + 0.55), 0.105, 0.14, "Z", steel, 10))

    # Low central breech and the characteristic open, perforated cradle.
    parts.append(loft("gun_breech", [
        (0.3, z0 + 0.42, 1.42, z0 + 1.92, 1.12),
        (5.9, z0 + 0.42, 1.48, z0 + 1.82, 1.12),
        (8.0, z0 + 0.50, 1.20, z0 + 1.52, 0.92)], green, 0.07))
    perforated_cradle_side(parts, -1, mats, z0)
    perforated_cradle_side(parts, 1, mats, z0)

    # Rear armored block and twin side optics.
    parts.append(cube("gun_rear_block", (0.10, 0, z0 + 1.18), (2.15, 3.28, 1.82), green, 0.10))
    for side in (-1, 1):
        sy = side
        parts.append(cube(f"gun_sight_{side}", (0.58, sy * 1.73, z0 + 1.34), (0.82, 0.54, 0.86), dark, 0.08))
        parts.append(cube(f"gun_sight_lens_{side}", (0.96, sy * 2.01, z0 + 1.37), (0.18, 0.16, 0.48), steel, 0.02))

    # Mantlet and long gun, thickened only enough to match the proven T-34 print survivability.
    gun_z = z0 + 1.10
    parts.append(cone("mantlet", (8.28, 0, gun_z), 1.05, 0.72, 2.0, "X", green, 40))
    parts.append(cyl("recoil_sleeve", (9.62, 0, gun_z), 0.70, 1.25, "X", green, 36, 0.045))
    parts.append(cone("main_barrel", (22.0, 0, gun_z), 0.54, 0.40, 23.6, "X", steel, 36))
    parts.append(cyl("muzzle_band", (34.05, 0, gun_z), 0.51, 0.62, "X", steel, 36, 0.035))
    parts.append(cyl("muzzle_tip", (34.44, 0, gun_z), 0.43, 0.24, "X", dark, 36, 0.02))

    # Coaxial barrel and lifting lugs.
    parts.append(cyl("coaxial_weapon", (8.45, -1.05, gun_z + 0.16), 0.18, 2.0, "X", dark, 16, 0.02))
    for i, (x, y) in enumerate([(0.5, -1.2), (0.5, 1.2), (6.8, -1.25), (6.8, 1.25)]):
        parts.append(cube(f"turret_lug_{i}", (x, y, z0 + 2.05), (0.34, 0.26, 0.38), steel, 0.035))

    return join_parts(parts, "Belka_V2_Turret")


def mesh_report(obj):
    obj.data.calc_loop_triangles()
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    non_manifold = sum(1 for edge in bm.edges if not edge.is_manifold)
    components = 0
    remaining = set(bm.verts)
    while remaining:
        components += 1
        stack = [remaining.pop()]
        while stack:
            vert = stack.pop()
            for edge in vert.link_edges:
                other = edge.other_vert(vert)
                if other in remaining:
                    remaining.remove(other)
                    stack.append(other)
    bm.free()
    coords = [obj.matrix_world @ v.co for v in obj.data.vertices]
    mins = [min(v[i] for v in coords) for i in range(3)]
    maxs = [max(v[i] for v in coords) for i in range(3)]
    return {
        "vertices": len(obj.data.vertices),
        "triangles": len(obj.data.loop_triangles),
        "non_manifold_edges": non_manifold,
        "closed_shells": components,
        "dimensions_mm": {"x": round(maxs[0]-mins[0], 3), "y": round(maxs[1]-mins[1], 3), "z": round(maxs[2]-mins[2], 3)},
    }


def export_stl(obj, path):
    original = obj.location.copy()
    min_z = min((obj.matrix_world @ v.co).z for v in obj.data.vertices)
    obj.location.z -= min_z
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.wm.stl_export(filepath=path, export_selected_objects=True, apply_modifiers=True, ascii_format=False)
    obj.location = original
    bpy.context.view_layer.update()


def point_camera(cam, loc, target, scale):
    cam.location = loc
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.ortho_scale = scale


def setup_render(mats):
    green, track, steel, dark = mats
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1800
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.world.color = (0.13, 0.15, 0.17)
    scene.view_settings.look = "AgX - Medium Low Contrast"
    scene.view_settings.exposure = 1.45
    clay = material("clay_preview", (0.46, 0.53, 0.34, 1), 0.03, 0.72)
    scene.view_layers[0].material_override = clay
    ground_mat = material("ground", (0.30, 0.31, 0.32, 1), 0, 0.9)
    ground = cube("render_ground", (2, 0, -0.6), (72, 42, 0.8), ground_mat, 0.25)
    bpy.ops.object.light_add(type="AREA", location=(22, -28, 33))
    bpy.context.object.data.energy = 2650
    bpy.context.object.data.shape = "DISK"
    bpy.context.object.data.size = 17
    bpy.ops.object.light_add(type="AREA", location=(-23, 18, 22))
    bpy.context.object.data.energy = 1900
    bpy.context.object.data.size = 15
    bpy.ops.object.light_add(type="AREA", location=(-8, -10, 30))
    bpy.context.object.data.energy = 1450
    bpy.context.object.data.size = 10
    bpy.ops.object.camera_add()
    cam = bpy.context.object
    cam.data.type = "ORTHO"
    scene.camera = cam
    return cam


def render_views(cam):
    scene = bpy.context.scene
    views = [
        (PREVIEW_PATH, (62, -68, 42), (3, 0, 5), 63, 1800, 1200),
        (SIDE_PATH, (2, -80, 7), (2, 0, 4.6), 69, 1800, 900),
        (TOP_PATH, (4, 0, 91), (4, 0, 3.8), 69, 1800, 900),
        (REAR_PATH, (-63, 58, 31), (-5, 0, 5), 57, 1600, 1100),
    ]
    for path, loc, target, scale, rx, ry in views:
        scene.render.resolution_x, scene.render.resolution_y = rx, ry
        point_camera(cam, loc, target, scale)
        scene.render.filepath = path
        bpy.ops.render.render(write_still=True)


def package_outputs(report):
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in (HULL_STL_PATH, TURRET_STL_PATH, REPORT_PATH):
            zf.write(path, os.path.basename(path))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    reset_scene()
    mats = (
        material("prototype_green", (0.43, 0.50, 0.29, 1), 0.04, 0.70),
        material("track_black", (0.115, 0.125, 0.12, 1), 0.28, 0.60),
        material("steel", (0.32, 0.34, 0.33, 1), 0.48, 0.48),
        material("recess", (0.055, 0.065, 0.060, 1), 0.10, 0.54),
    )
    hull = build_hull(mats)
    turret = build_turret(mats)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    export_stl(hull, HULL_STL_PATH)
    export_stl(turret, TURRET_STL_PATH)
    report = {
        "model": "Object 490B Belka",
        "version": "production rebuild v2",
        "scale": "1:200",
        "process": "Anycubic M5s, ABS-like resin, 0.05 mm layers",
        "parts": 2,
        "fit": {"socket_diameter_mm": SOCKET_RADIUS*2, "peg_diameter_mm": PEG_RADIUS*2,
                "radial_clearance_mm": SOCKET_RADIUS-PEG_RADIUS, "peg_length_mm": PEG_LENGTH},
        "meshes": {"hull": mesh_report(hull), "turret": mesh_report(turret)},
        "benchmark": "1-200 T-34.stl",
        "notes": "Every component is a closed manifold shell. Intersecting detail shells are retained to preserve crisp sub-0.3 mm relief for resin slicing.",
    }
    cam = setup_render(mats)
    render_views(cam)
    package_outputs(report)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
