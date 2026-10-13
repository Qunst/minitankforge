# Add New Tank Photos Workflow

Use this workflow when adding a new batch of tank photos to MiniTankForge.

## Non-Negotiable Rules

- Do not overwrite final site images until the owner approves the previews.
- Do not crop every tank to fill the frame.
- Do not reuse one crop size across a tank's six photos. Camera distance can change between every shot.
- Measure and normalize every source photograph independently, including painted and unpainted versions of the same angle.
- Keep scale and framing as separate checks. Correct scale does not excuse clipping, poor centering, or crowded framing.
- Existing site photos are sanity-check references, not the scale authority. Some legacy crops may be wrong.
- The canonical frame and the vehicle's real dimensions are the scale authority.

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

Measure the model itself. Exclude the gun barrel, shadow, loose scenery, and background marks.

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

Do not assume the tank is at exactly 45 degrees. Measure the horizontal contribution of both perpendicular hull axes:

- `length_dx_px`: average horizontal displacement between matching rear and front hull corners along the two sides;
- `width_dx_px`: average horizontal displacement between matching left and right hull corners across the front and rear.

Then calculate:

```text
raw_px_per_m = sqrt(
  (length_dx_px / real_hull_length_m)^2 +
  (width_dx_px / real_vehicle_width_m)^2
)
```

This accounts for both camera distance and the tank's rotation. Only horizontal components are used because camera elevation foreshortens tabletop depth in the vertical image direction.

If hull corners are partly hidden, use parallel track/fender edges and average the clearest matching segments. If neither axis can be identified reliably, stop and request a better photo; do not guess a fixed crop.

## Independent Centre and Crop

For every one of the six photographs:

1. Measure that photo's scale using its own landmarks.
2. Measure that photo's model centre independently.
3. Calculate its crop width and height from the canonical formula.
4. Position the crop around its independent centre.
5. Confirm the calculated crop stays inside the source image.

Never silently clamp an out-of-bounds crop. Add intentional padding or request a reshoot, then show that exception in the preview.

Natural perspective remains visible after normalization. A head-on quarter view may appear taller than a side view; that is not automatically a scale error. The measured real-world axes, not silhouette area, determine scale.

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
   - measured source span or quarter-view axis components;
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
- quarter views preserve plausible perspective after the two-axis calculation;
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
For side views use hull length, for front views use vehicle width, and for quarter views use both horizontal hull-axis components.
Provide the crop audit, new-tank lineup, scale comparisons, and all-six previews before applying final images.
After approval, apply final crops, update data/mappings, run checks, then archive source photos under D:\Sites\minitankforge unpushed\assets\img\unused.
```
