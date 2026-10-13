#!/usr/bin/env python3
"""Prepare scale-normalized tank-photo crops from an audited JSON manifest.

This command only creates proposals. It refuses to write into assets/img/tanks;
approved files must be copied there as a separate workflow step.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


FINAL_WIDTH = 1600
FINAL_HEIGHT = 900
FRAME_WIDTH_METRES = 16.0
TARGET_PIXELS_PER_METRE = FINAL_WIDTH / FRAME_WIDTH_METRES
DEFAULT_VERTICAL_ANCHOR = 510 / 900
MAX_QUARTER_EDGE_SCALE_DIFFERENCE = 0.15
MAX_QUARTER_EDGE_ANGLE_DIFFERENCE_DEGREES = 12.0
MAX_BACKGROUND_GEOMETRY_DIFFERENCE = 0.35
EXPECTED_VARIANTS = (
    "unpainted-side",
    "unpainted-quarter",
    "unpainted-front",
    "base-coat-side",
    "base-coat-quarter",
    "base-coat-front",
)
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class ManifestError(ValueError):
    pass


def finite_positive(value, label):
    try:
        number = float(value)
    except (TypeError, ValueError) as error:
        raise ManifestError(f"{label} must be a number") from error
    if not math.isfinite(number) or number <= 0:
        raise ManifestError(f"{label} must be greater than zero")
    return number


def finite_number(value, label):
    try:
        number = float(value)
    except (TypeError, ValueError) as error:
        raise ManifestError(f"{label} must be a number") from error
    if not math.isfinite(number):
        raise ManifestError(f"{label} must be finite")
    return number


def measurement_point(value, label):
    if not isinstance(value, list) or len(value) != 2:
        raise ManifestError(f"{label} must be [x, y]")
    return (
        finite_number(value[0], f"{label}[0]"),
        finite_number(value[1], f"{label}[1]"),
    )


def vector(start, end):
    return end[0] - start[0], end[1] - start[1]


def vector_length(value):
    return math.hypot(value[0], value[1])


def relative_difference(first, second):
    mean = (first + second) / 2
    return abs(first - second) / mean if mean else math.inf


def vector_angle_degrees(first, second):
    first_length = vector_length(first)
    second_length = vector_length(second)
    if not first_length or not second_length:
        return math.inf
    cosine = (first[0] * second[0] + first[1] * second[1]) / (first_length * second_length)
    cosine = max(-1.0, min(1.0, cosine))
    return math.degrees(math.acos(cosine))


def largest_singular_value(a, b, c, d):
    # Largest singular value of [[a, b], [c, d]] without requiring NumPy.
    sum_squares = a * a + b * b + c * c + d * d
    determinant = a * d - b * c
    discriminant = max(0.0, sum_squares * sum_squares - 4 * determinant * determinant)
    return math.sqrt((sum_squares + math.sqrt(discriminant)) / 2)


def quarter_pixels_per_metre(measurement, hull_length_m, vehicle_width_m, label):
    corners = measurement.get("corners")
    if not isinstance(corners, dict):
        raise ManifestError(f"{label}.measurement.corners must contain four audited chassis corners")

    rear_near = measurement_point(corners.get("rearNear"), f"{label}.measurement.corners.rearNear")
    front_near = measurement_point(corners.get("frontNear"), f"{label}.measurement.corners.frontNear")
    front_far = measurement_point(corners.get("frontFar"), f"{label}.measurement.corners.frontFar")
    rear_far = measurement_point(corners.get("rearFar"), f"{label}.measurement.corners.rearFar")

    length_near = vector(rear_near, front_near)
    length_far = vector(rear_far, front_far)
    width_rear = vector(rear_far, rear_near)
    width_front = vector(front_far, front_near)

    length_near_scale = vector_length(length_near) / hull_length_m
    length_far_scale = vector_length(length_far) / hull_length_m
    width_rear_scale = vector_length(width_rear) / vehicle_width_m
    width_front_scale = vector_length(width_front) / vehicle_width_m
    length_scale_difference = relative_difference(length_near_scale, length_far_scale)
    width_scale_difference = relative_difference(width_rear_scale, width_front_scale)
    length_angle_difference = vector_angle_degrees(length_near, length_far)
    width_angle_difference = vector_angle_degrees(width_rear, width_front)

    if length_scale_difference > MAX_QUARTER_EDGE_SCALE_DIFFERENCE:
        raise ManifestError(
            f"{label} opposing length edges differ by {length_scale_difference:.1%}; "
            "remeasure the chassis corners instead of accepting an uncertain crop"
        )
    if width_scale_difference > MAX_QUARTER_EDGE_SCALE_DIFFERENCE:
        raise ManifestError(
            f"{label} opposing width edges differ by {width_scale_difference:.1%}; "
            "remeasure the chassis corners instead of accepting an uncertain crop"
        )
    if length_angle_difference > MAX_QUARTER_EDGE_ANGLE_DIFFERENCE_DEGREES:
        raise ManifestError(
            f"{label} opposing length edges differ by {length_angle_difference:.1f} degrees; "
            "remeasure the chassis corners"
        )
    if width_angle_difference > MAX_QUARTER_EDGE_ANGLE_DIFFERENCE_DEGREES:
        raise ManifestError(
            f"{label} opposing width edges differ by {width_angle_difference:.1f} degrees; "
            "remeasure the chassis corners"
        )

    length_vector = (
        (length_near[0] + length_far[0]) / (2 * hull_length_m),
        (length_near[1] + length_far[1]) / (2 * hull_length_m),
    )
    width_vector = (
        (width_rear[0] + width_front[0]) / (2 * vehicle_width_m),
        (width_rear[1] + width_front[1]) / (2 * vehicle_width_m),
    )
    scale = largest_singular_value(
        length_vector[0], width_vector[0], length_vector[1], width_vector[1]
    )
    basis = (
        "quarter four-corner projection "
        f"length=({length_vector[0]:.2f},{length_vector[1]:.2f})px/m, "
        f"width=({width_vector[0]:.2f},{width_vector[1]:.2f})px/m, "
        f"opposing-edge differences={length_scale_difference:.1%}/{width_scale_difference:.1%}, "
        f"angles={length_angle_difference:.1f}/{width_angle_difference:.1f}deg"
    )
    return scale, basis


def resolve_path(root, value):
    path = Path(value)
    return path.resolve() if path.is_absolute() else (root / path).resolve()


def is_within(path, parent):
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def raw_pixels_per_metre(photo, hull_length_m, vehicle_width_m, label, side_reference_ppm=None):
    measurement = photo.get("measurement") or {}
    kind = measurement.get("kind")
    if kind == "side":
        span = finite_positive(measurement.get("spanPx"), f"{label}.measurement.spanPx")
        return span / hull_length_m, f"side span {span:g}px / hull {hull_length_m:g}m"
    if kind == "front":
        span = finite_positive(measurement.get("spanPx"), f"{label}.measurement.spanPx")
        return span / vehicle_width_m, f"front span {span:g}px / width {vehicle_width_m:g}m"
    if kind == "quarter":
        background = measurement.get("backgroundCalibration")
        if background is not None:
            if not isinstance(background, dict):
                raise ManifestError(f"{label}.measurement.backgroundCalibration must be an object")
            if side_reference_ppm is None:
                raise ManifestError(
                    f"{label} background calibration requires the same-finish side-view measurement"
                )
            side_span = finite_positive(
                background.get("sideReferenceSpanPx"),
                f"{label}.measurement.backgroundCalibration.sideReferenceSpanPx",
            )
            quarter_span = finite_positive(
                background.get("quarterSpanPx"),
                f"{label}.measurement.backgroundCalibration.quarterSpanPx",
            )
            scale = side_reference_ppm * quarter_span / side_span
            basis = (
                "quarter background-texture calibration from same-finish side "
                f"({side_reference_ppm:.2f}px/m × {quarter_span:g}px / {side_span:g}px)"
            )
            if measurement.get("corners") is not None:
                geometry_scale, geometry_basis = quarter_pixels_per_metre(
                    measurement, hull_length_m, vehicle_width_m, label
                )
                difference = relative_difference(scale, geometry_scale)
                if difference > MAX_BACKGROUND_GEOMETRY_DIFFERENCE:
                    raise ManifestError(
                        f"{label} background and chassis checks differ by {difference:.1%}; "
                        "remeasure the texture landmarks and chassis corners"
                    )
                basis += f"; geometry sanity difference={difference:.1%} ({geometry_basis})"
            return scale, basis
        if measurement.get("corners") is not None:
            scale, basis = quarter_pixels_per_metre(measurement, hull_length_m, vehicle_width_m, label)
            return scale, f"FALLBACK without background calibration: {basis}"
        length_dx = finite_positive(measurement.get("lengthDxPx"), f"{label}.measurement.lengthDxPx")
        width_dx = finite_positive(measurement.get("widthDxPx"), f"{label}.measurement.widthDxPx")
        scale = math.sqrt((length_dx / hull_length_m) ** 2 + (width_dx / vehicle_width_m) ** 2)
        return scale, (
            f"LEGACY quarter horizontal-only length {length_dx:g}px, width {width_dx:g}px; "
            "use four audited corners for new work"
        )
    raise ManifestError(f"{label}.measurement.kind must be side, front, or quarter")


def load_font(size, bold=False):
    candidates = [
        Path(r"C:\Windows\Fonts") / ("arialbd.ttf" if bold else "arial.ttf"),
        Path("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(str(candidate), size)
        except OSError:
            continue
    return ImageFont.load_default()


def fit_preview(image, size):
    return ImageOps.fit(image, size, method=Image.Resampling.LANCZOS)


def make_preview(tank, prepared, output_dir):
    margin, gap = 24, 18
    thumb_size = (480, 270)
    label_height = 58
    width = margin * 2 + thumb_size[0] * 3 + gap * 2
    height = 92 + (thumb_size[1] + label_height) * 2 + gap + 26
    sheet = Image.new("RGB", (width, height), "#f4efe6")
    draw = ImageDraw.Draw(sheet)
    draw.text((margin, 12), f"{tank['name']} — independently normalized proposals", fill="#20170f", font=load_font(28, True))
    draw.text((margin, 48), "Every photo has its own measurement, scale, crop size, and centre.", fill="#5c4631", font=load_font(18))
    by_variant = {item["variant"]: item for item in prepared}
    for index, variant in enumerate(EXPECTED_VARIANTS):
        item = by_variant[variant]
        row, column = divmod(index, 3)
        x = margin + column * (thumb_size[0] + gap)
        y = 84 + row * (thumb_size[1] + label_height + gap)
        with Image.open(item["outputPath"]).convert("RGB") as image:
            sheet.paste(fit_preview(image, thumb_size), (x, y))
        draw.rectangle((x, y, x + thumb_size[0] - 1, y + thumb_size[1] - 1), outline="#aa967d", width=2)
        draw.text((x, y + thumb_size[1] + 4), variant.replace("-", " "), fill="#20170f", font=load_font(18, True))
        draw.text(
            (x, y + thumb_size[1] + 27),
            f"{item['rawPixelsPerMetre']:.1f} raw px/m → {item['cropWidth']}×{item['cropHeight']}",
            fill="#b54d1b",
            font=load_font(16),
        )
    preview_dir = output_dir / "previews"
    preview_dir.mkdir(parents=True, exist_ok=True)
    path = preview_dir / f"{tank['slug']}-all-six-preview.jpg"
    sheet.save(path, quality=92, optimize=True)
    return path


def preflight(manifest, manifest_path, repo_root, output_dir):
    if not isinstance(manifest, dict) or not isinstance(manifest.get("tanks"), list) or not manifest["tanks"]:
        raise ManifestError("manifest.tanks must be a non-empty array")

    live_dir = (repo_root / "assets" / "img" / "tanks").resolve()
    if is_within(output_dir, live_dir):
        raise ManifestError(
            "proposal output cannot be assets/img/tanks or a child of it; generate previews elsewhere and copy only after approval"
        )

    prepared_tanks = []
    output_names = set()
    for tank_index, tank in enumerate(manifest["tanks"]):
        prefix = f"tanks[{tank_index}]"
        slug = str(tank.get("slug") or "")
        if not SLUG_RE.fullmatch(slug):
            raise ManifestError(f"{prefix}.slug must be lowercase kebab-case")
        name = str(tank.get("name") or "").strip()
        if not name:
            raise ManifestError(f"{prefix}.name is required")
        hull_length_m = finite_positive(tank.get("hullLengthM"), f"{prefix}.hullLengthM")
        vehicle_width_m = finite_positive(tank.get("vehicleWidthM"), f"{prefix}.vehicleWidthM")
        photos = tank.get("photos")
        if not isinstance(photos, list) or len(photos) != 6:
            raise ManifestError(f"{prefix}.photos must contain exactly six entries")
        variants = [photo.get("variant") for photo in photos]
        if set(variants) != set(EXPECTED_VARIANTS) or len(set(variants)) != 6:
            raise ManifestError(f"{prefix}.photos must contain every required variant exactly once")

        photos_by_variant = {photo["variant"]: photo for photo in photos}
        side_reference_scales = {}
        for finish in ("unpainted", "base-coat"):
            side_variant = f"{finish}-side"
            side_photo = photos_by_variant[side_variant]
            side_label = f"{prefix}.photos[{photos.index(side_photo)}]"
            side_reference_scales[finish] = raw_pixels_per_metre(
                side_photo, hull_length_m, vehicle_width_m, side_label
            )[0]

        tank_prepared = []
        for photo_index, photo in enumerate(photos):
            label = f"{prefix}.photos[{photo_index}]"
            variant = photo["variant"]
            expected_kind = variant.rsplit("-", 1)[-1]
            actual_kind = (photo.get("measurement") or {}).get("kind")
            if actual_kind != expected_kind:
                raise ManifestError(f"{label} variant {variant} requires measurement.kind={expected_kind}")
            source = resolve_path(repo_root, photo.get("source") or "")
            if not source.is_file():
                raise ManifestError(f"{label}.source does not exist: {source}")
            center = photo.get("center")
            if not isinstance(center, list) or len(center) != 2:
                raise ManifestError(f"{label}.center must be [x, y] measured independently for this photo")
            center_x = finite_positive(center[0], f"{label}.center[0]")
            center_y = finite_positive(center[1], f"{label}.center[1]")
            vertical_anchor = float(photo.get("verticalAnchor", manifest.get("verticalAnchor", DEFAULT_VERTICAL_ANCHOR)))
            if not math.isfinite(vertical_anchor) or not 0.35 <= vertical_anchor <= 0.75:
                raise ManifestError(f"{label}.verticalAnchor must be between 0.35 and 0.75")

            finish = "base-coat" if variant.startswith("base-coat-") else "unpainted"
            raw_ppm, basis = raw_pixels_per_metre(
                photo,
                hull_length_m,
                vehicle_width_m,
                label,
                side_reference_ppm=side_reference_scales[finish],
            )
            crop_width = round(raw_ppm * FRAME_WIDTH_METRES)
            crop_height = round(crop_width * FINAL_HEIGHT / FINAL_WIDTH)
            with Image.open(source) as image:
                source_width, source_height = image.size
            left = round(center_x - crop_width / 2)
            top = round(center_y - crop_height * vertical_anchor)
            if left < 0 or top < 0 or left + crop_width > source_width or top + crop_height > source_height:
                raise ManifestError(
                    f"{label} crop ({left}, {top}, {crop_width}, {crop_height}) exceeds source {source_width}×{source_height}; "
                    "do not clamp silently—remeasure, add intentional padding, or reshoot"
                )
            normalized_ppm = raw_ppm * FINAL_WIDTH / crop_width
            if abs(normalized_ppm - TARGET_PIXELS_PER_METRE) / TARGET_PIXELS_PER_METRE > 0.01:
                raise ManifestError(f"{label} normalized scale differs from {TARGET_PIXELS_PER_METRE:g}px/m by more than 1%")
            output_name = f"{slug}-{variant}-detail.jpg"
            if output_name in output_names:
                raise ManifestError(f"duplicate output filename: {output_name}")
            output_names.add(output_name)
            tank_prepared.append({
                "tank": name,
                "slug": slug,
                "variant": variant,
                "sourcePath": source,
                "outputPath": output_dir / output_name,
                "sourceWidth": source_width,
                "sourceHeight": source_height,
                "centerX": center_x,
                "centerY": center_y,
                "verticalAnchor": vertical_anchor,
                "measurementBasis": basis,
                "rawPixelsPerMetre": raw_ppm,
                "cropLeft": left,
                "cropTop": top,
                "cropWidth": crop_width,
                "cropHeight": crop_height,
                "normalizedPixelsPerMetre": normalized_ppm,
            })
        prepared_tanks.append(({"slug": slug, "name": name}, tank_prepared))
    return prepared_tanks


def write_outputs(prepared_tanks, output_dir, quality):
    output_dir.mkdir(parents=True, exist_ok=True)
    report_rows = []
    previews = []
    for tank, items in prepared_tanks:
        for item in items:
            with Image.open(item["sourcePath"]).convert("RGB") as image:
                crop = image.crop((
                    item["cropLeft"],
                    item["cropTop"],
                    item["cropLeft"] + item["cropWidth"],
                    item["cropTop"] + item["cropHeight"],
                ))
                crop = crop.resize((FINAL_WIDTH, FINAL_HEIGHT), Image.Resampling.LANCZOS)
                crop.save(item["outputPath"], quality=quality, optimize=True)
            report_rows.append({
                key: str(value) if isinstance(value, Path) else value
                for key, value in item.items()
                if key != "outputPath"
            } | {"outputPath": str(item["outputPath"])})
        previews.append(make_preview(tank, items, output_dir))

    json_path = output_dir / "crop-scale-audit.json"
    json_path.write_text(json.dumps(report_rows, indent=2), encoding="utf-8")
    csv_path = output_dir / "crop-scale-audit.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(report_rows[0]))
        writer.writeheader()
        writer.writerows(report_rows)
    return json_path, csv_path, previews


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, type=Path, help="JSON crop manifest")
    parser.add_argument("--output", required=True, type=Path, help="temporary proposal directory")
    parser.add_argument("--quality", type=int, default=92, choices=range(80, 96), metavar="80-95")
    args = parser.parse_args(argv)

    repo_root = Path(__file__).resolve().parents[1]
    manifest_path = args.manifest.resolve()
    output_dir = args.output.resolve()
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        prepared_tanks = preflight(manifest, manifest_path, repo_root, output_dir)
        json_path, csv_path, previews = write_outputs(prepared_tanks, output_dir, args.quality)
    except (ManifestError, json.JSONDecodeError, OSError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1

    count = sum(len(items) for _, items in prepared_tanks)
    print(f"Prepared {count} independently normalized proposals at {output_dir}")
    print(f"Audit JSON: {json_path}")
    print(f"Audit CSV: {csv_path}")
    for preview in previews:
        print(f"Preview: {preview}")
    print("Approval is still required before copying any file into assets/img/tanks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
