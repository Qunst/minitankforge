#!/usr/bin/env python3
"""Render one printable A4 shipping label from normalized JSON."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


def register_fonts() -> tuple[str, str]:
    candidates = [
        (
            Path("C:/Windows/Fonts/arial.ttf"),
            Path("C:/Windows/Fonts/arialbd.ttf"),
        ),
        (
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        ),
    ]
    for regular, bold in candidates:
        if regular.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont("LabelRegular", str(regular)))
            pdfmetrics.registerFont(TTFont("LabelBold", str(bold)))
            return "LabelRegular", "LabelBold"
    return "Helvetica", "Helvetica-Bold"


REGULAR_FONT, BOLD_FONT = register_fonts()
ORDERS_PER_PAGE = 4
ORDER_SLOT_HEIGHT = A4[1] / ORDERS_PER_PAGE
SENDER_X = 125 * mm
SIDE_MARGIN = 15 * mm


def clean_lines(value) -> list[str]:
    if isinstance(value, str):
        value = value.splitlines()
    return [str(item).strip() for item in (value or []) if str(item).strip()]


def wrap_line(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    if not words:
        return []
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if pdfmetrics.stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def wrapped_lines(lines: list[str], font: str, size: float, width: float) -> list[str]:
    result: list[str] = []
    for line in lines:
        result.extend(wrap_line(line, font, size, width))
    return result


def fitting_size(
    lines: list[str],
    font: str,
    preferred: float,
    minimum: float,
    width: float,
    height: float,
    leading_factor: float = 1.18,
) -> tuple[float, list[str]]:
    size = preferred
    while size >= minimum:
        wrapped = wrapped_lines(lines, font, size, width)
        if wrapped and len(wrapped) * size * leading_factor <= height:
            return size, wrapped
        size -= 0.5
    return minimum, wrapped_lines(lines, font, minimum, width)


def draw_lines_from_top(
    pdf: canvas.Canvas,
    lines: list[str],
    x: float,
    top: float,
    font: str,
    size: float,
    leading: float,
) -> None:
    text = pdf.beginText(x, top - size)
    text.setFont(font, size)
    text.setLeading(leading)
    for line in lines:
        text.textLine(line)
    pdf.drawText(text)


def draw_recipient(pdf: canvas.Canvas, recipient: dict) -> None:
    x = 15 * mm
    top = A4[1] - 6 * mm
    width = 94 * mm
    height = 47 * mm
    padding = 5 * mm
    pdf.setLineWidth(1.1)
    pdf.rect(x, top - height, width, height, stroke=1, fill=0)

    name = str(recipient.get("name") or "").strip()
    address = clean_lines(recipient.get("address_lines"))
    phone = str(recipient.get("phone") or "").strip()
    available_width = width - 2 * padding
    available_height = height - 2 * padding

    name_size, name_lines = fitting_size(
        [name] if name else [], BOLD_FONT, 18, 14, available_width, 12 * mm
    )
    name_leading = name_size * 1.12
    name_height = len(name_lines) * name_leading + (2.5 * mm if name_lines else 0)
    reserved_phone_size = 13.5 if phone else 0
    reserved_phone_height = reserved_phone_size * 1.15 + (1 * mm if phone else 0)
    address_size, address_lines = fitting_size(
        address,
        REGULAR_FONT,
        18,
        12.5,
        available_width,
        max(10 * mm, available_height - name_height - reserved_phone_height),
    )

    cursor_top = top - padding
    if name_lines:
        draw_lines_from_top(pdf, name_lines, x + padding, cursor_top, BOLD_FONT, name_size, name_leading)
        cursor_top -= len(name_lines) * name_leading + 2.5 * mm
    address_leading = address_size * 1.16
    draw_lines_from_top(
        pdf,
        address_lines,
        x + padding,
        cursor_top,
        REGULAR_FONT,
        address_size,
        address_leading,
    )
    cursor_top -= len(address_lines) * address_leading
    if phone:
        phone_size = min(13.5, max(10.5, address_size - 2))
        phone_lines = wrapped_lines([phone], REGULAR_FONT, phone_size, available_width)
        cursor_top -= 1 * mm
        draw_lines_from_top(
            pdf,
            phone_lines,
            x + padding,
            cursor_top,
            REGULAR_FONT,
            phone_size,
            phone_size * 1.15,
        )


def draw_sender(pdf: canvas.Canvas, sender: dict) -> float:
    x = SENDER_X
    top = A4[1] - 6 * mm
    padding = 2 * mm
    name = str(sender.get("name") or "").strip()
    address = clean_lines(sender.get("address_lines"))
    size = 11.5
    while size >= 9.5:
        name_lines = [name] if name else []
        address_lines = address
        widths = [pdfmetrics.stringWidth(line, BOLD_FONT, size) for line in name_lines]
        widths.extend(pdfmetrics.stringWidth(line, REGULAR_FONT, size) for line in address_lines)
        if max(widths, default=0) <= 55 * mm:
            break
        size -= 0.5
    leading = size * 1.18
    line_count = len(name_lines) + len(address_lines)
    text_width = max(widths, default=0)
    text_height = size + max(0, line_count - 1) * leading + 1.5
    width = text_width + 2 * padding
    height = text_height + 2 * padding

    pdf.setLineWidth(0.9)
    pdf.rect(x, top - height, width, height, stroke=1, fill=0)
    cursor_top = top - padding
    if name_lines:
        draw_lines_from_top(pdf, name_lines, x + padding, cursor_top, BOLD_FONT, size, leading)
        cursor_top -= len(name_lines) * leading
    draw_lines_from_top(pdf, address_lines, x + padding, cursor_top, REGULAR_FONT, size, leading)

    pdf.saveState()
    pdf.setLineWidth(1.2)
    pdf.line(x, top, x + width, top - height)
    pdf.line(x + width, top, x, top - height)
    pdf.restoreState()
    return top - height


def draw_bounded_text(
    pdf: canvas.Canvas, text: str, x: float, top: float,
    width: float, height: float, font: str, preferred: float,
) -> None:
    size = preferred
    leading_factor = 1.16
    while True:
        lines = []
        for line in wrap_line(text, font, size, width):
            # Split an unusually long word so it cannot enter the other column.
            start = 0
            for end in range(1, len(line) + 1):
                if pdfmetrics.stringWidth(line[start:end], font, size) > width:
                    lines.append(line[start:end - 1])
                    start = end - 1
            lines.append(line[start:])
        limit = int(height / (size * leading_factor))
        if len(lines) <= limit or size <= 8:
            break
        size -= 0.5
    if limit <= 0:
        return
    if len(lines) > limit:
        lines = lines[:limit]
        while pdfmetrics.stringWidth(lines[-1] + "…", font, size) > width:
            lines[-1] = lines[-1][:-1]
        lines[-1] += "…"
    draw_lines_from_top(pdf, lines, x, top, font, size, size * leading_factor)


def draw_description(pdf: canvas.Canvas, description: str, item_total: str | None, with_note: bool) -> None:
    x = SIDE_MARGIN
    if item_total:
        draw_lines_from_top(pdf, [f"Item total: {item_total}"], x, A4[1] - 55 * mm, REGULAR_FONT, 11, 13)
    top = A4[1] - 60 * mm
    if with_note:
        draw_bounded_text(pdf, description, x, top, SENDER_X - x - 5 * mm,
                          ORDER_SLOT_HEIGHT - 62 * mm, REGULAR_FONT, 12)
        return
    width = 180 * mm
    height = 11 * mm
    size, lines = fitting_size(
        [description], REGULAR_FONT, 12, 9.5, width, height
    )
    leading = size * 1.2
    draw_lines_from_top(pdf, lines, x, top, REGULAR_FONT, size, leading)


def draw_uk_vat(
    pdf: canvas.Canvas,
    vat: dict | None,
    sender_bottom: float,
) -> float:
    if not vat:
        return sender_bottom
    width = 49 * mm
    height = 20 * mm
    x = SENDER_X
    top = sender_bottom - 5 * mm
    padding = 3 * mm
    pdf.setLineWidth(0.9)
    pdf.rect(x, top - height, width, height, stroke=1, fill=0)
    lines = [
        f"Etsy VAT: {vat['number']}",
        f"VAL: {vat['currency']} {vat['value']}",
    ]
    size = 9
    leading = 20
    content_height = size + leading
    text_top = top - (height - content_height) / 2
    draw_lines_from_top(pdf, lines, x + padding, text_top, REGULAR_FONT, size, leading)
    return top - height


def draw_order(pdf: canvas.Canvas, payload: dict, vertical_offset: float = 0) -> None:
    pdf.saveState()
    pdf.translate(0, vertical_offset)
    draw_recipient(pdf, payload["recipient"])
    sender_bottom = draw_sender(pdf, payload["sender"])
    vat_bottom = draw_uk_vat(pdf, payload.get("uk_vat"), sender_bottom)
    note = " ".join(str(payload.get("important_note") or "").split())
    draw_description(pdf, str(payload.get("description") or "Order"), payload.get("item_total"), bool(note))
    if note:
        top = min(A4[1] - 55 * mm, vat_bottom - 2 * mm)
        bottom = A4[1] - ORDER_SLOT_HEIGHT + 2 * mm
        pdf.setFillColorRGB(0.72, 0.06, 0.06)
        draw_bounded_text(pdf, note, SENDER_X, top, A4[0] - SIDE_MARGIN - SENDER_X, top - bottom, BOLD_FONT, 12)
    pdf.restoreState()


def render(input_path: Path, output_path: Path) -> None:
    payload = json.loads(input_path.read_text(encoding="utf-8"))
    orders = payload.get("orders") if isinstance(payload, dict) else None
    if not orders:
        orders = [payload]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(output_path), pagesize=A4, pageCompression=1)
    pdf.setTitle(str(payload.get("title") or "Shipping label"))
    pdf.setAuthor("MiniTankForge")
    pdf.setSubject("Printable order shipping label")

    for page_start in range(0, len(orders), ORDERS_PER_PAGE):
        page_orders = orders[page_start : page_start + ORDERS_PER_PAGE]
        pdf.setFillColorRGB(0, 0, 0)
        pdf.setStrokeColorRGB(0, 0, 0)
        for slot_index, order in enumerate(page_orders):
            draw_order(pdf, order, -slot_index * ORDER_SLOT_HEIGHT)
            separator_y = A4[1] - (slot_index + 1) * ORDER_SLOT_HEIGHT
            if separator_y > 0:
                pdf.saveState()
                pdf.setStrokeColorRGB(0.55, 0.55, 0.55)
                pdf.setLineWidth(0.6)
                pdf.setDash(4, 3)
                pdf.line(10 * mm, separator_y, A4[0] - 10 * mm, separator_y)
                pdf.restoreState()
        pdf.showPage()
    pdf.save()


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: render-shipping-label.py INPUT.json OUTPUT.pdf")
    render(Path(sys.argv[1]), Path(sys.argv[2]))
    print(Path(sys.argv[2]).resolve())


if __name__ == "__main__":
    main()
