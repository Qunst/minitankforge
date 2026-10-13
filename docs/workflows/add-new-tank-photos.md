# Add New Tank Photos Workflow

Use this workflow when adding a new batch of tank photos to MiniTankForge.

## Non-Negotiable Rules

- Do not overwrite final site images until the owner approves the previews.
- Do not crop every tank to fill the frame.
- Do not reuse one crop size across a tank's six photos. Camera distance can change between every shot.
- Measure and normalize every source photograph independently, including painted and unpainted versions of the same angle.
- Keep scale and framing as separate checks. Correct scale does not excuse clipping, poor centering, or crowded framing.
- Existing site photos are sanity-check references, not the scale authority. Some legacy crops may be wrong.
- The canonical frame and the vehicle's real dimensions are the scale authority. Quarter views transfer that physical scale from the same-finish side view by matching tabletop texture.

## Source Assumptions

- New photos are normally placed in a temporary folder such as `assets/img/new` or `assets/img/tanks/newtanks`.
- Each tank group must contain exactly six photos in this logical order:
  1. unpainted side
  2. unpainted quarter
  3. unpainted front
  4. base coat side
  5. base coat quarter
  6. base coat front
- The first file in each group is normally named with the tank name.
- Never trust file order or colour detection blindly. Visually confirm the finish and angle of all six sources.

## Canonical Image Scale

Every final tank image is `1600×900` and represents a `16.0×9.0 m` camera frame.

- Horizontal scale: `100 output pixels per real metre`.
- Crop width in source pixels: `round(raw pixels per metre × 16.0)`.
- Crop height in source pixels: `round(crop width × 9 / 16)`.
- Resize the calculated crop to exactly `1600×900`.
- Default vertical anchor: place the measured model centre at `510/900`, or 56.7%, of crop height. Adjust the centre when necessary for framing, but never change crop size merely to improve composition.

This standard was calibrated from multiple established medium/heavy tank anchors. It supersedes copying the crop dimensions of a single reference photo.

## Required Vehicle Dimensions

Before measuring photos, record:

- real hull/body length in metres, excluding the gun barrel;
- real vehicle width in metres, normally the outer track/body width.

Do not use barrel-inclusive overall length as hull length. If published dimensions conflict, document the selected values and their source. For fictional or paper-project vehicles, use the intended chassis or the closest defensible family dimensions and record that assumption.

## Per-Photo Measurement Rules

Measure the model itself for side and front views. Exclude the gun barrel, shadow, loose scenery, and background marks. Quarter views use stable background marks as a camera-distance ruler after the same-finish side view establishes physical scale.

### Side View

Measure the source-photo hull span horizontally, excluding the barrel.

```text
raw_px_per_m = hull_span_px / real_hull_length_m
```

Use the front and rear hull or track endpoints, not the gun tip.

### Front View

Measure the source-photo vehicle width horizontally.

```text
raw_px_per_m = vehicle_width_span_px / real_vehicle_width_m
```

Use the outer body or track edges. Do not include shadow or outward-pointing equipment that is not part of the published width.

### Quarter View

Use the same-finish side photograph as the physical-scale reference. Camera distance often changes between the side and quarter shots, so match two recognizable tabletop marks that lie on the same plane near the model and are visible in both originals.

Measure the distance between those exact two marks in each source image. These map to `sideReferenceSpanPx` and `quarterSpanPx` in the manifest:

- `side_reference_span_px`: background span in the same-finish side original;
- `quarter_span_px`: the identical background span in the quarter original.

```text
quarter_raw_px_per_m = side_raw_px_per_m
                     × quarter_span_px
                     / side_reference_span_px
```

This uses the tabletop as the camera-distance ruler and avoids treating the larger visible top surface of a quarter view as extra scale. Prefer marks close to the model, far enough apart for a stable measurement, and at similar image depth. Do not compare spans from different physical parts of the tabletop.

As a sanity check, identify four matching chassis corners and compare the projected length and width axes. The background calibration remains primary. A geometry estimate that differs by more than 35% blocks the crop and requires remeasurement.

If reliable background matches are unavailable, the audited four-corner chassis method may be used as a fallback. Never infer quarter scale from silhouette area, PCA, bounding-box width, a presumed 45-degree angle, or the side photo's crop size alone. If neither background nor chassis landmarks are reliable, request a better photo.

For a legacy `1600×900` site crop whose original is missing, label the result as source-limited. Texture matching may still determine the correction. If the model must become smaller, shrink the complete existing crop and extend only clean tabletop background at the edges; do not synthesize or redraw any part of the vehicle. Keep this as an exception, not the normal new-photo workflow.

## Independent Centre and Crop

For every one of the six photographs:

1. Measure that photo's scale using its own landmarks.
2. Measure that photo's model centre independently.
3. Calculate its crop width and height from the canonical formula.
4. Position the crop around its independent centre.
5. Confirm the calculated crop stays inside the source image.

Never silently clamp an out-of-bounds crop. Add intentional padding or request a reshoot, then show that exception in the preview.

Natural perspective remains visible after normalization. A head-on quarter view may occupy more image area than a side view because more top surface is visible; that is not automatically a scale error. Matching tabletop texture should remain approximately the same apparent size after normalization.

## Reusable Crop Tool

Create a JSON manifest based on `docs/workflows/tank-photo-crop-manifest.example.json`, then run:

```powershell
python scripts/prepare-tank-photo-crops.py `
  --manifest path\to\tank-photo-crop-manifest.json `
  --output .codex_tmp\tank-photo-proposals
```

If the system Python lacks Pillow, use the Codex bundled workspace Python returned by the workspace-dependencies tool.

The tool:

- requires exactly six recognized variants per tank;
- requires an independent measurement and centre for every photo;
- calculates a separate crop size for every photo;
- blocks measurement/view mismatches;
- blocks crops that exceed the source image;
- blocks output under `assets/img/tanks`;
- writes `crop-scale-audit.json` and `crop-scale-audit.csv`;
- writes an all-six preview sheet for every tank.

The crop tool creates proposals only. Approval and the final copy are separate steps.

## Required Audit Artifacts

Before requesting approval, provide:

1. A measurement record for all source photos containing:
   - source filename and assigned variant;
   - real hull length and vehicle width;
   - measured source span or quarter-view background-calibration spans;
   - raw pixels per metre;
   - crop box and normalized pixels per metre.
2. An all-six preview sheet for every tank.
3. A lineup of all new base-coat side views at canonical scale.
4. Same-family or nearby-size comparison sheets using existing site photos.
5. Source measurement overlays or gridded close-ups whenever a landmark is ambiguous.

The normalized scale calculation must be within 1% of `100 px/m`. A larger error blocks approval. Mathematical success alone is insufficient; visually inspect every proposal.

## Visual QA

Check scale first, then framing.

Scale checks:

- painted and unpainted photos of the same angle represent the same physical scale despite different camera distances;
- side views match hull length;
- front views match vehicle width;
- quarter views have tabletop texture at approximately the same apparent scale as their same-finish side references;
- same-chassis vehicles remain coherent;
- small vehicles remain visibly smaller than medium and heavy vehicles.

Framing checks:

- no hull, barrel, fascine, gun shield, track, wheel, or artillery part is cut off;
- sufficient headroom remains above turrets, guns, and equipment;
- the model is not jammed against any edge;
- object placement is consistent without changing the calculated scale.

Useful family checks include:

- KV-1 / KV-2 / KV-85;
- Sherman / Easy Eight / Jumbo / Firefly / M10 / Achilles / M36;
- Panzer III / StuG III;
- Panzer IV / Jagdpanzer IV;
- Churchill variants;
- Tiger I / Sturmtiger.

Stop and show the previews for approval. Do not apply final images yet.

## Final Image Output

After approval, copy only the approved proposals into `assets/img/tanks` using:

- `[slug]-base-coat-side-detail.jpg`
- `[slug]-base-coat-quarter-detail.jpg`
- `[slug]-base-coat-front-detail.jpg`
- `[slug]-unpainted-side-detail.jpg`
- `[slug]-unpainted-quarter-detail.jpg`
- `[slug]-unpainted-front-detail.jpg`

Use `[slug]-base-coat-side-detail.jpg` as the tank card/main image.

## Data Updates

After final images are applied:

- Add or update the tank in `assets/js/tanks-data.js` if needed.
- Add or update the detail gallery mapping in `assets/js/app.js` if needed.
- Re-check the browse/card side image against nearby vehicles.
- Run syntax, image-existence, and static-page generation checks.
- Re-open the final site views and confirm scale and framing did not change during the copy.

## Cleanup

After final approval and application:

1. Rename original sources to:
   - `[slug]-unpainted-side-original.jpg`
   - `[slug]-unpainted-quarter-original.jpg`
   - `[slug]-unpainted-front-original.jpg`
   - `[slug]-base-coat-side-original.jpg`
   - `[slug]-base-coat-quarter-original.jpg`
   - `[slug]-base-coat-front-original.jpg`
2. Move renamed originals to `D:\Sites\minitankforge unpushed\assets\img\unused\[source-folder-name-or-date]`.
3. Delete temporary proposals and previews only after final files are verified.
4. Delete the empty source folder.
5. Summarize exactly what changed.

## Reusable Prompt

```text
Use docs/workflows/add-new-tank-photos.md and the canonical per-photo crop tool.

Add the new tank photos from [folder path].

Important:
Do not overwrite final images until I approve the previews.
Use the 16.0 m canonical frame and measure every source photo independently.
Never reuse one crop size for all six views.
For side views use hull length, for front views use vehicle width, and for quarter views transfer the same-finish side scale by matching tabletop texture. Use four chassis corners only as a sanity check or fallback.
Provide the crop audit, new-tank lineup, scale comparisons, and all-six previews before applying final images.
After approval, apply final crops, update data/mappings, run checks, then archive source photos under D:\Sites\minitankforge unpushed\assets\img\unused.
```
