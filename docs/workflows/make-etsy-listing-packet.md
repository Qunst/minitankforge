# Make Etsy Listing Packet Workflow

Use this workflow when preparing a new Etsy listing packet for a MiniTankForge tank.

## Core Rules

- This packet workflow is the manual fallback. For API-created listings, use
  `docs/workflows/etsy-api-toolkit.md`.

- Always paste the complete listing packet directly into the chat response.
- A saved packet file may be provided as an optional backup, but it must never replace the full packet in chat.
- Recommend an existing Etsy listing to copy so its variation structure and pack-size wording carry over.
- Give the full description, not only changed parts.
- Give the exact photo multi-open string.
- Keep tags Etsy-safe: each tag must be 20 characters or fewer.
- Output the final 13 tags as one copy-paste block, separated by comma and space.
- Do not include a `Tags to replace` section; the owner pastes the complete final tag block.
- Do not include separate `Materials` or `Scale attribute` sections; those settings do not change in the normal listing flow.
- Do not include standard `Variations` or `Prices` sections. Include a short exception section only when the requested listing genuinely needs nonstandard variations or pricing.
- Etsy titles must not contain `%`, `&`, or `:` more than once. For the safest validation, use no more than one occurrence in total across those three characters and prefer using none.
- Never put a colon-form scale list such as `1:160 1:180 1:200 1:250 1:285` in an Etsy title. Use slash-form scales such as `1/160 1/180 1/200 1/250 1/285`, or omit the scale list from the title.
- If unsure about tank classification, official name, historical wording, or tags, stop and ask instead of guessing.

## Choosing The Listing To Copy

Choose by product type and variation wording first, then by nation or model similarity. Keep these groups distinct:

- **Tanks and tank-like AFVs:** tanks, tank destroyers, assault guns, self-propelled guns/artillery, and engineering tanks normally use `1 tank`, `5 tanks`, and `10 tanks`. Copy another listing that already uses those labels.
- **Non-tank vehicles:** armored cars, trucks, half-tracks, artillery tractors, and similar transport/support vehicles use `1 vehicle`, `5 vehicles`, and `10 vehicles`. Copy another non-tank vehicle listing.
- **Towed artillery:** anti-tank guns, field guns, cannons, howitzers, and mortars copy another towed-artillery listing. Preserve the established noun used for that product class, such as `gun`, `howitzer`, or `mortar`; do not leave `tank` or `vehicle` in the pack-size labels.
- **Sets and game packs:** copy a set or pack with the same kind of contents and quantity structure. Do not copy a standalone miniature listing.
- **Other future product classes:** crews, infantry, terrain, accessories, aircraft, or boats must copy the closest listing from the same class so their quantity noun and variation structure make sense. If the catalogue has no same-class template, treat it as a nonstandard setup rather than forcing it into one of the groups above.
- Within the correct product type, prefer the closest nation, role, or vehicle family.
- Verify the source listing's actual live Etsy variation dropdowns before recommending it. Do not infer the labels from the title or description; a description may use the correct noun while the selectable `Pack size` values still use the wrong one.
- Check both variation groups: confirm the expected `Scale / finish` structure and read every selectable `Pack size` value.
- In the packet, state briefly why that listing is the correct template, for example: `Copy Sherman M4A3 — verified tank pack-size labels.`
- If no fully suitable listing exists, say so, identify the closest template, state what is wrong with it, and add a concise `Nonstandard setup` section with the exact variation labels that must be changed after copying.
- A source listing with incorrect live labels is never presented as a clean direct-copy recommendation, even if its description is correct.

## Etsy Title Validation

Before delivering a listing packet:

1. Count every `%`, `&`, and `:` character in the proposed title.
2. If those characters occur more than once in total, rewrite the title before delivery. Prefer zero occurrences so future Etsy validation changes cannot break it.
3. Do not repeat colon-form scales in the title. Slash-form scales are acceptable for the title; retain the normal colon form in descriptions, variations, price tables, and Etsy's scale attribute.
4. Keep the title readable and verify it fits Etsy's current title-length limit.

Example:

```text
Wrong: Type 1 Gun, 1:160 1:180 1:200 1:250 1:285
Right: Type 1 Gun Miniature, 1/160 1/180 1/200 1/250 1/285
```

## Photo Multi-Open Format

Use this exact format so it can be pasted into the file-open dialog:

```text
"[slug]-base-coat-side-detail.jpg" "[slug]-base-coat-quarter-detail.jpg" "[slug]-base-coat-front-detail.jpg" "[slug]-unpainted-side-detail.jpg" "[slug]-unpainted-quarter-detail.jpg" "[slug]-unpainted-front-detail.jpg"
```

Before delivering the string, count its characters. Some Windows file-open dialogs truncate the file-name field at about 260 characters. If the complete string is longer than 259 characters, provide two shorter upload batches instead. The owner should upload the first batch, reopen the photo picker, and upload the second batch.

## Description Requirements

The description should include:

- Short first paragraph with tank name, nation, role, and tabletop use.
- A clear note if the listing is for a specific variant, not a related variant.
- Available scales.
- Available finishes.
- Pack sizes.
- A short historical/use paragraph.
- Material note.
- Buyer notes about small 3D printed miniatures.
- Website line:

```text
You can also browse more tanks, finish examples, and scale information on my MiniTankForge site:
https://minitankforge.com
```

## Output Format

For each listing packet, paste all of the following directly into the chat response:

1. Recommended listing to copy from
2. Photo multi-open string
3. Title
4. Full description
5. Final 13 tags as one comma-separated copy-paste block

Do not add `Tags to replace`, `Materials`, `Scale attribute`, `Variations`, or `Prices` sections during the normal flow. If the closest copy template has incorrect variation labels, or if variations or pricing otherwise differ from the established standard, append one concise `Nonstandard setup` section containing only the exact corrections.

## Reusable Prompt

```text
Use docs/workflows/make-etsy-listing-packet.md.

Make an Etsy listing packet for [tank name / slug].

Use our MiniTankForge listing rules:
- recommend a listing to copy based primarily on matching product type and pack-size wording
- verify the live Etsy `Scale / finish` and `Pack size` dropdown values; do not trust the description alone
- if no fully correct template exists, name the closest one and add the exact required label corrections under `Nonstandard setup`
- provide the full description
- provide exact photo multi-open string
- keep tags 20 characters or fewer
- output final 13 tags as one comma-separated copy-paste block
- omit tags-to-replace, materials, scale-attribute, standard-variation, and standard-price sections
- include variation or price information only when the listing needs a nonstandard exception
- validate the title so `%`, `&`, and `:` do not occur more than once in total
- never use a repeated colon-form scale list in the title; use slash-form scales or omit the list
- stop and ask if unsure instead of guessing
```
