# Add New Tank Photos Workflow

Use this workflow when adding a new batch of tank photos to MiniTankForge.

## Source Assumptions

- New photos are usually placed in `assets/img/tanks/newtanks`.
- Each tank group should contain 6 photos.
- The first file in each group should be manually named with the correct tank name.
- The expected order per tank group is:
  1. unpainted side
  2. unpainted quarter
  3. unpainted front
  4. base coat side
  5. base coat quarter
  6. base coat front
- Do not trust the group order blindly when writing final filenames. Visually confirm which three are base coat and which three are unpainted before naming or moving files.

## Critical Cropping Rules

- Do not overwrite final site images until the preview is approved.
- Do not crop each tank to fill the frame.
- Preserve believable visual scale across the site.
- Use existing tank photos as scale references, not only automatic crop detection.
- Check real vehicle dimensions before choosing crop scale.
- Use vehicle width as the primary scale reference, especially with front or near-front photos. Width avoids the common barrel/no-barrel ambiguity in published lengths.
- Use body/hull length only as a secondary cross-check. Never use gun-forward overall length as the sole scale target.
- Keep tanks centered with enough padding so hulls and barrels are not cut off.
- The same tank must keep the same apparent scale between base coat and unpainted photos.
- Treat scale and framing as separate checks: a crop can be the correct size but still be bad if the vehicle is too high/low, clipped, or awkwardly crowded.

## Scale References

- Heavy tanks: compare with Tiger / Tiger II.
- Medium tanks: compare with Panther / T-34 / Sherman.
- Super-heavy tanks: compare with Jagdpanzer E 100 / Maus-class expectations.
- Small tanks: keep visibly smaller than medium tanks.
- Same-family vehicles must be checked together when possible:
  - KV-1 and KV-2 should read as similar hull scale; KV-2 is taller, not much longer.
  - IS, ISU, and SU vehicles should stay coherent with their shared chassis families.
  - Sherman, Firefly, M10, and Achilles should not drift wildly from each other.
  - Panzer III and StuG III should remain visually related; Panzer IV and Jagdpanzer IV should remain visually related.
  - Churchill variants should read as long heavy infantry tanks, noticeably longer than Shermans.

## Required Size Check

Before making crop proposals:

1. Look up or estimate each new vehicle's real width and use it as the primary scale reference.
2. Use front or near-front product photos to compare apparent width with the selected references.
3. Look up body/hull length as a secondary check and note whether any published length includes the gun/barrel. Never let a barrel-inclusive length override the width check.
4. Pick at least two existing site references:
   - one close in real vehicle width;
   - one smaller or larger nearby vehicle to bracket the expected size.
5. Use the existing final card images as visual references, and original source photos where available.
6. If a new vehicle is fictional, prototype, or paper-project, use the closest chassis or intended family as the scale reference and note that assumption.

## Preview First

Before writing final images:

1. Read the source folder and identify each tank group from the manually named first file.
2. Match each new tank to a reference already on the site.
3. Do the required size check above.
4. Create temporary proposed crops only.
5. Make a scale comparison preview sheet comparing each new tank side-by-side with close references.
6. Make a second preview sheet showing all 6 crops for every new tank.
7. Check relative tank size first.
8. Then check framing/cropping separately:
   - no hull, barrel, fascine, gun shield, tracks, or wheels cut off;
   - enough headroom above tall turrets, guns, fascines, or artillery parts;
   - model should not sit jammed against the top/bottom edge;
   - base coat and unpainted versions should have matching apparent scale and placement.
9. Stop and show the previews for approval.

Do not apply final images until the preview is approved.

## Final Image Output

After approval, copy approved crops to `assets/img/tanks` with these names:

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
- Re-check the browse/card side image against nearby vehicles after final writes.
- Run syntax and image existence checks.

## Cleanup

After the final images are approved and applied:

1. Rename original source photos to:
   - `[slug]-unpainted-side-original.jpg`
   - `[slug]-unpainted-quarter-original.jpg`
   - `[slug]-unpainted-front-original.jpg`
   - `[slug]-base-coat-side-original.jpg`
   - `[slug]-base-coat-quarter-original.jpg`
   - `[slug]-base-coat-front-original.jpg`
2. Move renamed originals to `assets/img/unused/[source-folder-name-or-date]`.
3. Delete temporary preview/proposal files.
4. Delete the now-empty source folder.
5. Summarize exactly what changed.

## Reusable Prompt

```text
Use docs/workflows/add-new-tank-photos.md.

Add the new tank photos from [folder path].

Important:
Do not overwrite final images until I approve the preview.
Preserve believable tank scale across the site.
Use existing tank images as scale references.
Show a scale comparison preview and an all-six-crops preview before applying final images.
After approval, apply final crops, update data/mappings if needed, run checks, then clean up source photos into assets/img/unused.
```
