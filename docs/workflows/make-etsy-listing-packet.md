# Make Etsy Listing Packet Workflow

Use this workflow when preparing a new Etsy listing packet for a MiniTankForge tank.

## Core Rules

- Always paste the complete listing packet directly into the chat response.
- A saved packet file may be provided as an optional backup, but it must never replace the full packet in chat.
- Copy from the closest existing Etsy listing, not a random listing.
- Give the full description, not only changed parts.
- Give the exact photo multi-open string.
- Keep tags Etsy-safe: each tag must be 20 characters or fewer.
- Tell the user exactly which existing tags to replace with which new tags.
- Output the final 13 tags as one copy-paste block, separated by comma and space.
- Use `Resin` as the Etsy material if Etsy does not allow `ABS-like resin`.
- Use only one Etsy scale attribute, usually `1:160`.
- If unsure about tank classification, official name, historical wording, or tags, stop and ask instead of guessing.

## Choosing The Listing To Copy

Pick the closest existing listing by nation, role, and vehicle family.

Examples:

- Tiger II: copy from Tiger I.
- German tank destroyers: copy from Ferdinand / E-25, whichever is closest.
- Soviet tanks: copy from T-34 or SU-85.
- American tanks: copy from Sherman or M18 Hellcat.
- Same chassis or vehicle family beats generic nation matching.

## Photo Multi-Open Format

Use this exact format so it can be pasted into the file-open dialog:

```text
"[slug]-unpainted-side-detail.jpg" "[slug]-base-coat-front-detail.jpg" "[slug]-base-coat-quarter-detail.jpg" "[slug]-base-coat-side-detail.jpg" "[slug]-unpainted-front-detail.jpg" "[slug]-unpainted-quarter-detail.jpg"
```

Before delivering the string, count its characters. Some Windows file-open dialogs truncate the file-name field at about 260 characters. If the complete string is longer than 259 characters, provide two shorter upload batches instead. The owner should upload the first batch, reopen the photo picker, and upload the second batch.

## Standard Variations

Use two variations:

- `Scale / finish`
- `Pack size`

Scale / finish values:

- `1:160 Unpainted`
- `1:160 Base coated`
- `1:180 Unpainted`
- `1:180 Base coated`
- `1:200 Unpainted`
- `1:200 Base coated`
- `1:250 Unpainted`
- `1:250 Base coated`
- `1:285 Unpainted`
- `1:285 Base coated`

Pack size values:

- `1 tank`
- `5 tanks`
- `10 tanks`

## Standard Prices

```text
1:160 Unpainted - 1 tank €3.50, 5 tanks €14.00, 10 tanks €23.50
1:160 Base coated - 1 tank €4.50, 5 tanks €18.00, 10 tanks €30.00

1:180 Unpainted - 1 tank €3.50, 5 tanks €14.00, 10 tanks €23.50
1:180 Base coated - 1 tank €4.50, 5 tanks €18.00, 10 tanks €30.00

1:200 Unpainted - 1 tank €3.00, 5 tanks €12.00, 10 tanks €20.00
1:200 Base coated - 1 tank €4.00, 5 tanks €16.00, 10 tanks €27.00

1:250 Unpainted - 1 tank €2.50, 5 tanks €10.00, 10 tanks €17.00
1:250 Base coated - 1 tank €3.50, 5 tanks €14.00, 10 tanks €23.50

1:285 Unpainted - 1 tank €2.50, 5 tanks €10.00, 10 tanks €17.00
1:285 Base coated - 1 tank €3.50, 5 tanks €14.00, 10 tanks €23.50
```

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
5. Tags to replace
6. Final 13 tags as one comma-separated copy-paste block
7. Materials
8. Scale field recommendation
9. Variation setup reminder
10. Price table

## Reusable Prompt

```text
Use docs/workflows/make-etsy-listing-packet.md.

Make an Etsy listing packet for [tank name / slug].

Use our MiniTankForge listing rules:
- copy from the closest existing Etsy listing
- provide the full description
- provide exact photo multi-open string
- keep tags 20 characters or fewer
- say exactly which tags to replace
- output final 13 tags as one comma-separated copy-paste block
- use standard scale / finish and pack size variations
- use standard pricing
- use Resin as the Etsy material
- use only one Etsy scale attribute, usually 1:160
- stop and ask if unsure instead of guessing
```
