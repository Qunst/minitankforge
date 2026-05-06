# MiniTankForge Project Handoff

Last updated: 2026-05-06

This document is for future Codex sessions. Read this first before making changes.

## Project Identity

MiniTankForge is a browse-only showcase site for 3D printed miniature tanks, sets, and game-ready packs.

Owner:
- Davorin, from Croatia
- Etsy shop: Quali3DPrints
- Main site: https://minitankforge.com
- Etsy section used across the site: https://www.etsy.com/shop/Quali3DPrints?section_id=58368275

Core business rule:
- Customers cannot order directly on this site.
- The site helps people browse, compare scale/finish, and then either contact Davorin with a request or continue to Etsy.
- Direct request flow: customer contacts Davorin, details are confirmed, then payment is handled separately by PayPal.
- Etsy remains an option, but the site should clearly explain the direct-request option.

Tone:
- Practical, clear, warm, and hobby-friendly.
- Avoid corporate filler.
- Avoid making the site feel like a checkout/cart system.

## Current Tech Shape

This is a static site.

Important root files:
- `index.html` - homepage
- `tanks.html` - browse tanks page
- `tank.html` - single tank page shell
- `sets.html` - browse sets page
- `set.html` - single set page shell
- `how-this-works.html` - browse-only/direct request explanation
- `finish-guide.html` - unpainted vs base coat explanation
- `scale-comparison.html` - scale reference page
- `gallery.html` - photo gallery
- `reviews.html` - testimonial/review page
- `about.html` - warmer about/process page
- `faq.html` - FAQ page
- `tank-requests.html` - general request/contact form

Important assets:
- `assets/css/styles.css` - all site styling
- `assets/js/app.js` - rendering/filter/selection logic
- `assets/js/tanks-data.js` - tank catalog data
- `assets/js/sets-data.js` - set/game pack catalog data
- `assets/img/tanks/` - final tank photos used by site
- `assets/img/sets/` - final set/game pack photos used by site
- `assets/img/unused/` - archived original photos and backups, ignored by git
- `assets/img/textures/` - texture assets, including hero/button textures
- `docs/workflows/add-new-tank-photos.md` - saved workflow for adding tank photos
- `docs/workflows/make-etsy-listing-packet.md` - saved workflow for Etsy listing packets

Cloudflare deployment:
- `wrangler.jsonc` deploys static assets from the repo root.
- The project has used Cloudflare Workers/Pages static assets.
- Domain is served through Cloudflare DNS.
- Porkbun was the original registrar; Cloudflare DNS nameservers are used.

Contact:
- Request form posts to Formspree: `https://formspree.io/f/mpqkrvqk`
- Mailto fallback sends to `quali3dprint@gmail.com`
- Cloudflare Email Routing was also configured for `requests@minitankforge.com` forwarding, but the site form currently uses Formspree plus mailto.

## Collaboration Rules From The Owner

Always follow these:
- Before coding, explain which files you plan to change.
- Keep changes minimal and high-confidence.
- After coding, summarize exactly what changed.
- Do not guess on visual/cropping work. Inspect source files, make previews, and ask if uncertain.
- Do not skip steps in Etsy listing packets. The owner wants full copy-paste blocks.
- Do not add direct checkout/cart/order behavior to the site.
- Do not overwrite user work or unrelated changes.

Before doing any non-trivial work:
1. Run `git status --short`.
2. Read the relevant data/rendering files.
3. State the planned changed files.
4. Patch only what is needed.
5. Verify with `git diff` or targeted checks.

## Design Direction

The site uses a warm tabletop/military-miniatures look:
- Parchment/off-white backgrounds.
- Subtle paper/hero texture.
- Brown/olive/metal button treatment.
- Orange Etsy CTA button.
- Card borders should look intentional, not hard/pasted.
- Filters should be styled, not generic white browser selects.
- Keep the visual language consistent across pages.

Important UI notes:
- Header navigation is split into two rows on wider pages.
- Footer/header links should remain consistent across all pages.
- Mobile footer navigation should remain visible; this was previously a bug.
- Browse Tanks and Browse Sets use a textured top area above the cards.
- Tank cards and set cards are the main content; avoid excessive empty vertical space above them.

## Data Model Notes

### Tanks

Primary data lives in `assets/js/tanks-data.js`.

Important conventions:
- Tank names use `Common name (Official name)` format where available.
- Tank card/main image should generally use the base-coat side detail image.
- Unlisted tanks should have price `0` until an Etsy listing exists.
- Listed tanks should have direct `etsyUrl` to the listing, not just the shop section.
- Tanks support scale, finish, and pack-size selection on the site.
- Site price is informational only; final purchase still happens on Etsy or by direct request.

Tank photo naming:
```text
[slug]-base-coat-side-detail.jpg
[slug]-base-coat-quarter-detail.jpg
[slug]-base-coat-front-detail.jpg
[slug]-unpainted-side-detail.jpg
[slug]-unpainted-quarter-detail.jpg
[slug]-unpainted-front-detail.jpg
```

Tank detail gallery order in `app.js`:
1. base coat side
2. base coat quarter
3. base coat front
4. unpainted side
5. unpainted quarter
6. unpainted front

Behavior:
- Page initially opens on image 1, base coat side.
- Clicking `Base coat` finish switches the main image to image 2, base coat quarter.
- Clicking `Unpainted` switches the main image to image 5, unpainted quarter.
- Thumbnail clicks still replace the large image manually.

### Sets

Primary data lives in `assets/js/sets-data.js`.

Set types currently include:
- Starter sets
- Tank sets
- Tank destroyer sets
- Early war set
- Experimental set
- Game-ready packs

Non-game set prices are standardized:
```text
1:160 Unpainted EUR 22.00 / Base coat EUR 29.00
1:180 Unpainted EUR 19.00 / Base coat EUR 25.00
1:200 Unpainted EUR 16.00 / Base coat EUR 21.00
1:250 Unpainted EUR 14.00 / Base coat EUR 19.00
1:285 Unpainted EUR 13.00 / Base coat EUR 18.00
```

Non-game set photo naming:
```text
[set-slug]-base-coat-side.jpg
[set-slug]-base-coat-quarter.jpg
[set-slug]-base-coat-front.jpg
[set-slug]-unpainted-side.jpg
[set-slug]-unpainted-quarter.jpg
[set-slug]-unpainted-front.jpg
```

Etsy primary images for sets use:
```text
[set-slug]-etsy-primary.jpg
```

Game-ready packs have option-specific photos. The page chooses the matching image based on pack contents and finish. The scale button is active even when there is only one available scale.

Game pack scale/pricing:
- Hellcat Tankers Pack: 1:285 only
- Lone Sherman Pack: 1:250 only
- Lone Sherman Pacific Pack: 1:250 only

## Image Processing Rules

Pillow is installed locally under `.python-packages` in this workspace.

Use this before Python image scripts:
```powershell
$env:PYTHONPATH="$PWD\.python-packages"
```

General image rules:
- Use real product photos; do not invent product images.
- Use Pillow for deterministic crop/resize/quality work.
- Use `view_image` or preview contact sheets before accepting uncertain visual work.
- Do not leave temporary preview sheets in final assets.
- Store original/backup photos under `assets/img/unused/...`.
- `assets/img/unused/**` is ignored by git.

Tank crop rule:
- Do not crop every tank to fill the frame.
- The goal is consistent visual model scale across the site.
- Match new tanks to a reference tank before final output.
- Examples:
  - Heavy tanks compare to Tiger II / Tiger.
  - Medium tanks compare to Panther / T-34 / Sherman.
  - Super-heavy tanks compare to Jagdpanzer E 100 / Maus-class expectations.
  - Small Japanese tanks should remain visibly smaller.
- If unsure about expected real/model size, stop and ask.
- Create a preview sheet before writing final cropped images when adding new tank batches.

Set/game Etsy primary image rule:
- Etsy thumbnails do not work well with very wide 16:9 site images.
- Create natural 4:3 primary images from original `4000x3000` photos when available.
- Preferred output size: `2400x1800`.
- Avoid artificial blurred padding unless the owner explicitly asks for it.
- Prefer base-coat full/quarter group photos for main Etsy listing images.

## Existing Workflow Docs

Use these instead of rebuilding process from memory:

### Add Tank Photos

File:
- `docs/workflows/add-new-tank-photos.md`

Use when adding new tank photo batches. It contains the hard rule about scale-consistent cropping, preview sheets, final filenames, and cleanup.

### Make Etsy Listing Packet

File:
- `docs/workflows/make-etsy-listing-packet.md`

Use when creating an Etsy listing packet for a tank. It is tank-oriented, but the same spirit applies to sets:
- Copy the closest existing listing.
- Provide full description, not partial edits.
- Provide exact photo multi-open string.
- Keep tags 20 characters or fewer.
- Tell the owner exactly which tags to replace.
- Use `Resin` in Etsy material if `ABS-like resin` is not accepted.
- Use only one Etsy scale attribute, usually `1:160`.
- Stop and ask if unsure.

Important owner correction:
- Do not skip description or other packet sections.
- Listing packets should be easy to copy/paste.

## Etsy Listing Conventions

### Tank Listings

Tank listing variations:
- `Scale / finish`
- `Pack size`

Scale / finish values:
```text
1:160 Unpainted
1:160 Base coated
1:180 Unpainted
1:180 Base coated
1:200 Unpainted
1:200 Base coated
1:250 Unpainted
1:250 Base coated
1:285 Unpainted
1:285 Base coated
```

Pack size values:
```text
1 tank
5 tanks
10 tanks
```

Tank listing prices:
```text
1:160 Unpainted - 1 tank EUR 3.50, 5 tanks EUR 14.00, 10 tanks EUR 23.50
1:160 Base coated - 1 tank EUR 4.50, 5 tanks EUR 18.00, 10 tanks EUR 30.00

1:180 Unpainted - 1 tank EUR 3.50, 5 tanks EUR 14.00, 10 tanks EUR 23.50
1:180 Base coated - 1 tank EUR 4.50, 5 tanks EUR 18.00, 10 tanks EUR 30.00

1:200 Unpainted - 1 tank EUR 3.00, 5 tanks EUR 12.00, 10 tanks EUR 20.00
1:200 Base coated - 1 tank EUR 4.00, 5 tanks EUR 16.00, 10 tanks EUR 27.00

1:250 Unpainted - 1 tank EUR 2.50, 5 tanks EUR 10.00, 10 tanks EUR 17.00
1:250 Base coated - 1 tank EUR 3.50, 5 tanks EUR 14.00, 10 tanks EUR 23.50

1:285 Unpainted - 1 tank EUR 2.50, 5 tanks EUR 10.00, 10 tanks EUR 17.00
1:285 Base coated - 1 tank EUR 3.50, 5 tanks EUR 14.00, 10 tanks EUR 23.50
```

Etsy materials:
- Use `Resin`.
- Etsy rejected/does not allow `ABS-like resin` as a material field. Mention ABS-like resin in the description text instead.

Etsy scale attribute:
- Etsy only allows one scale field in the attribute area.
- Use `1:160` unless the listing is game-specific with a fixed scale.

### Set Listings

Non-game set variations:
- `Scale`
- `Finish`

Set finish labels:
- `Unpainted`
- `Base coat`

Use full descriptions and exact photo multi-open strings.

### Game Pack Listings

Game pack variations usually use:
- Fixed `Scale` with only one option
- Pack option / contents
- Finish

Keep nomenclature consistent:
- Use `Unpainted`, not `Raw Print`
- Use `Base coat`, not `Base color`

Fixed game scales:
- Hellcat Tankers Pack: 1:285
- Lone Sherman Pack: 1:250
- Lone Sherman Pacific Pack: 1:250

## Important Existing Content

About page facts:
- Davorin is from Croatia.
- This started as a hobby, then became extra profit for the home.
- Resin printing is used.
- Resin is ABS-like, tougher and more resistant to damage than standard brittle resin.
- Models are made from scratch or heavily modified from simple online models.
- Mike Lambo games inspired game sets.
- Three YouTube endorsement links were added/discussed:
  - https://www.youtube.com/watch?v=8Bs7_AGLYaU
  - https://www.youtube.com/watch?v=c82884c8DCU
  - https://www.youtube.com/watch?v=fPNNeSwEu5w

Finish Guide facts:
- Options are Unpainted and Base coat.
- Base coat defaults by nation:
  - German tanks: grey
  - US tanks: brown
  - Russian/Soviet tanks: green
  - Japanese tanks: khaki/olive-khaki direction
- Customers can contact Davorin to request different paint/base coat options.

FAQ/request messaging:
- Site is browse-only.
- For direct requests, customer sends details, Davorin confirms, payment is handled afterward by PayPal.
- Etsy remains available for checkout.

## SEO / Routing Notes

SEO tags were added across pages:
- `title`
- meta description
- canonical URL
- Open Graph tags

Canonical/redirect issues were previously caught by Seobility. Be careful not to create loops between extensionless URLs and `.html`.

Current canonical style generally points to extensionless public URLs:
```text
https://minitankforge.com/about
https://minitankforge.com/tanks
```

If changing routes:
- Check `sitemap.xml`.
- Check `robots.txt`.
- Avoid self-referential redirect/canonical loops.

## Development Commands

There is no complex build step documented. This is static HTML/CSS/JS.

Useful checks:
```powershell
git status --short
git diff -- assets/js/tanks-data.js
git diff -- assets/js/sets-data.js
Select-String -Path assets/js/sets-data.js -Pattern "slug: 'example-slug'" -Context 0,40
Select-String -Path assets/js/tanks-data.js -Pattern "slug: 'example-slug'" -Context 0,40
```

Pillow check:
```powershell
$env:PYTHONPATH="$PWD\.python-packages"
python -c "from PIL import Image; print(Image.__version__)"
```

## How Future Codex Should Start

Recommended first response/action pattern:
1. Acknowledge the task.
2. Say which file(s) you plan to inspect/change.
3. Run `git status --short`.
4. Inspect relevant data/rendering/assets.
5. Make the smallest safe change.
6. Verify with diff or preview.
7. Summarize exactly what changed.

For image-heavy tasks:
- Generate preview sheets before finalizing when there is any uncertainty.
- Show previews with `view_image`.
- Do not write final output until the relative size/crop is checked.

For Etsy listing tasks:
- Use `docs/workflows/make-etsy-listing-packet.md`.
- Always include:
  - Recommended listing to copy
  - Title
  - Photo multi-open string
  - Full description
  - Tags to replace
  - Final 13 tags
  - Materials
  - Scale field recommendation
  - Variation setup
  - Price table

For Etsy link updates:
- Edit only `etsyUrl` in `assets/js/tanks-data.js` or `assets/js/sets-data.js`.
- Use slug-specific context to avoid placing a URL on the wrong item.
- Verify the diff carefully before final response.

## Known Gotchas

- `assets/img/unused/**` is intentionally ignored by git. Do not expect those originals to deploy.
- Some old workflows produced temporary preview images. Clean previews up unless the owner wants to keep them.
- The owner cares strongly about correct tank scale in photos. Do not crop tanks to identical visual size.
- Etsy tag limit is 20 characters per tag. Check tags before giving them.
- Etsy material should be `Resin`, not `ABS-like resin`.
- Etsy scale attribute can only be one value, even if variations include multiple scales.
- Do not call game pack finishes `Raw Print` or `Base color`; use `Unpainted` and `Base coat`.
- Direct Etsy variant URL automation was considered too much manual work because listing variation IDs are unique per listing.
- The site should say "choose the same options on Etsy" rather than trying to deep-link every variant.

## Current External Etsy Listing Coverage

Many individual tanks already have direct Etsy listing URLs in `assets/js/tanks-data.js`.

Set/game direct URLs currently exist for:
- German Starter Set
- USSR Starter Set
- US Starter Set
- German Tanks Set
- USSR Tanks Set
- German Tank Destroyers Set
- USSR Tank Destroyers Set
- German Early Years Set
- German Experimental Set
- Hellcat Tankers Pack
- Lone Sherman Pack
- Lone Sherman Pacific Pack

When the owner provides a new Etsy URL, update the matching `etsyUrl` only.

