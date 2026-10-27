# Etsy API Toolkit

This local Node.js tool connects the Quali3DPrints Etsy shop to the Etsy Open API.
It authenticates, creates complete unpublished drafts from saved plans, verifies live
listings, saves complete backups, and performs guarded variation-value renames.

## Private configuration

Store credentials only in `.env.etsy.local` at the repository root:

```text
ETSY_API_KEYSTRING=your_keystring
ETSY_SHARED_SECRET=your_shared_secret
ETSY_REDIRECT_URI=http://localhost:3003/oauth/redirect
```

Optional OAuth scope override:

```text
ETSY_SCOPES=listings_r listings_w shops_r shops_w transactions_r
```

The `.env.etsy.local` file and `.etsy-private/` directory must never be committed.

## First connection

From the repository root:

```powershell
node scripts/etsy/etsy-api.mjs ping
node scripts/etsy/etsy-api.mjs auth
```

The `auth` command starts the localhost callback server and prints an Etsy authorization
URL. Open the URL, approve the requested permissions, and let Etsy redirect back to the
local callback. The resulting OAuth token is stored in `.etsy-private/oauth-token.json`.

Then verify the authenticated shop:

```powershell
node scripts/etsy/etsy-api.mjs check
```

The tool refreshes expired access tokens automatically while the refresh token remains
valid.

## Read-only commands

List a shop's active listings:

```powershell
node scripts/etsy/etsy-api.mjs listings active
```

Save a listing and its complete variation inventory before any future edit:

```powershell
node scripts/etsy/etsy-api.mjs backup LISTING_ID
```

Backups are stored under `.etsy-private/backups/` and are excluded from Git.

## Safety boundary

Variation renames follow this sequence:

1. Fetch and save the full listing and inventory.
2. Produce a dry-run diff containing only the requested labels.
3. Confirm that prices, quantities, SKUs, enabled flags, and all other variation values
   are unchanged.
4. Require explicit owner approval for that exact listing and diff.
5. Update Etsy, fetch the inventory again, and verify it against the approved result.

Generate a dry run:

```powershell
node scripts/etsy/etsy-api.mjs rename-values LISTING_ID "Pack size" "1 tank=1 vehicle" "5 tanks=5 vehicles" "10 tanks=10 vehicles"
```

The dry run validates the complete inventory and writes a private plan without changing
Etsy. To execute that same transformation after approval, append `--apply`:

```powershell
node scripts/etsy/etsy-api.mjs rename-values LISTING_ID "Pack size" "1 tank=1 vehicle" "5 tanks=5 vehicles" "10 tanks=10 vehicles" --apply
```

The apply command creates a fresh before-backup, sends the full inventory update, reads
the inventory back, and fails verification unless all products, offerings, prices,
quantities, SKUs, processing profiles, and variation dimensions match the approved plan.

## Creating a draft from a template

Draft plans are private JSON files under `.etsy-private/plans/`. For ordinary tank
listings, use the published T-44 (`4604340866`) as the default template because it has
the verified tank variation labels, prices, profiles, and processing setup. Use a
different verified template for artillery, non-tank vehicles, sets, or other product
classes.

### Standard tank plan

Every standard tank plan must define:

- a unique slug, title, full description, and exactly 13 tags;
- `template_listing_id` for the correct product class;
- `materials: ["Resin"]` and quantity `50`;
- structured attributes `Resin` and `1:160`;
- six JPEGs with unique alt text;
- the `Scale / finish` variation property;
- the base-coated and unpainted quarter-view images used by variation selections.

Start from [`etsy-tank-plan.example.json`](etsy-tank-plan.example.json), save the filled
copy under `.etsy-private/plans/SLUG.json`, and remove the `_template_only` marker.

Use this photo order:

1. Base-coated side
2. Base-coated quarter
3. Base-coated front
4. Unpainted side
5. Unpainted quarter
6. Unpainted front

All `Base coated` values use image 2. All `Unpainted` values use image 5.

### End-to-end creation

Always generate a no-change validation first:

```powershell
node scripts/etsy/etsy-api.mjs create-complete-draft .etsy-private/plans/NEW-SLUG.json
```

The dry run checks the title restrictions, 13 tag limits, source images, template,
complete 30-product inventory, quantity, attributes, and variation-image configuration.
It refuses an exact-title duplicate and changes nothing on Etsy.

After reviewing the dry run, create and fully configure the unpublished draft:

```powershell
node scripts/etsy/etsy-api.mjs create-complete-draft .etsy-private/plans/NEW-SLUG.json --apply
```

The command:

1. Creates a draft only; it never publishes.
2. Copies the template's shipping, return, processing, category, section, and complete
   price/variation structure.
3. Uploads the six images in plan order.
4. Sets quantity 50 on every offering.
5. Sets free-form material and structured Resin/1:160 attributes.
6. Maps every finish value to the correct quarter-view photo.
7. Reads everything back and fails unless it matches.
8. Saves private before/after and verification records.

For a batch, dry-run every plan first. Create one listing at a time and do not continue
past a failed verification until it is understood.

### Manual Etsy review and publication

Open the returned Etsy editor link and review the listing. The one required field that
Open API v3 cannot set or verify is:

```text
How does your shop produce this item? -> It's made from scratch
```

Select it manually. Review the preview, then let the shop owner publish. Do not use
browser automation on Etsy, and do not publish through the toolkit.

### Final sanity check

Check the draft before publication and repeat after publication:

```powershell
node scripts/etsy/etsy-api.mjs check-listing LISTING_ID .etsy-private/plans/NEW-SLUG.json
```

A passing result confirms title, description, tags, image order/alt text, materials,
structured attributes, all 30 offerings, all prices and quantities, variation photos,
shipping, returns, processing, category, section, maker fields, and auto-renew. It
accepts either `draft` or `active` state and reports the actual state. The manual
`It's made from scratch` field remains outside API verification.

Use `audit-listing` for a human-readable diagnostic dump and `backup` before any later
manual repair:

```powershell
node scripts/etsy/etsy-api.mjs audit-listing LISTING_ID
node scripts/etsy/etsy-api.mjs backup LISTING_ID
```

## Reusable request

```text
Use docs/workflows/etsy-api-toolkit.md.

Create unpublished Etsy drafts for these new tank slugs: [SLUGS].
Use the verified T-44 standard unless a product is not a tank. Build and validate every
private plan first, then create one draft at a time, run full read-back verification,
and give me the editor links. Never publish. Remind me to select "It's made from
scratch" manually on each listing, and run check-listing after I publish.
```
