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

## Critical Cropping Rules

- Do not overwrite final site images until the preview is approved.
- Do not crop each tank to fill the frame.
- Preserve believable visual scale across the site.
- Use existing tank photos as scale references, not only automatic crop detection.
- Keep tanks centered with enough padding so hulls and barrels are not cut off.
- The same tank must keep the same apparent scale between base coat and unpainted photos.

## Scale References

- Heavy tanks: compare with Tiger / Tiger II.
- Medium tanks: compare with Panther / T-34 / Sherman.
- Super-heavy tanks: compare with Jagdpanzer E 100 / Maus-class expectations.
- Small tanks: keep visibly smaller than medium tanks.

## Preview First

Before writing final images:

1. Read the source folder and identify each tank group from the manually named first file.
2. Match each new tank to a reference already on the site.
3. Create temporary proposed crops only.
4. Make a preview sheet comparing each new tank side-by-side with its reference.
5. Make a second preview sheet showing all 6 crops for every new tank.
6. Check relative tank size first, then centering and clipping.
7. Stop and show the previews for approval.

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
