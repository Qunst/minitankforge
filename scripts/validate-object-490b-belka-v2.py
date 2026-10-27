import json
import os

import bpy
import bmesh


OUT_DIR = r"D:\Sites\minitankforge unpushed\stls\object-490b-belka-1-200-v2"


def report(obj):
    obj.data.calc_loop_triangles()
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    non_manifold = sum(1 for edge in bm.edges if not edge.is_manifold)
    components = 0
    component_infos = []
    remaining = set(bm.verts)
    while remaining:
        components += 1
        first = remaining.pop()
        stack = [first]
        comp_verts = [first]
        while stack:
            vert = stack.pop()
            for edge in vert.link_edges:
                other = edge.other_vert(vert)
                if other in remaining:
                    remaining.remove(other)
                    stack.append(other)
                    comp_verts.append(other)
        xs = [v.co.x for v in comp_verts]
        ys = [v.co.y for v in comp_verts]
        zs = [v.co.z for v in comp_verts]
        component_infos.append({
            "vertices": len(comp_verts),
            "center": [round((min(xs)+max(xs))/2, 2), round((min(ys)+max(ys))/2, 2), round((min(zs)+max(zs))/2, 2)],
            "size": [round(max(xs)-min(xs), 2), round(max(ys)-min(ys), 2), round(max(zs)-min(zs), 2)],
        })
    bm.free()
    return {
        "vertices": len(obj.data.vertices),
        "triangles": len(obj.data.loop_triangles),
        "non_manifold_edges": non_manifold,
        "components": components,
        "largest_components": sorted(component_infos, key=lambda x: x["vertices"], reverse=True)[:12],
    }


results = {}
for voxel_size in (0.05, 0.075, 0.10, 0.125):
    for name in ("Belka_V2_Hull", "Belka_V2_Turret"):
        source = bpy.data.objects[name]
        test = source.copy()
        test.data = source.data.copy()
        bpy.context.collection.objects.link(test)
        test.name = name + "_RemeshTest"
        bpy.context.view_layer.objects.active = test
        test.select_set(True)
        test.data.remesh_voxel_size = voxel_size
        test.data.remesh_voxel_adaptivity = 0.0
        bpy.ops.object.voxel_remesh()
        results[f"{name}_{voxel_size:.3f}"] = report(test)
        bpy.data.objects.remove(test, do_unlink=True)

path = os.path.join(OUT_DIR, "object-490b-belka-1-200-v2-remesh-test.json")
with open(path, "w", encoding="utf-8") as handle:
    json.dump(results, handle, indent=2)
print(json.dumps(results, indent=2))
