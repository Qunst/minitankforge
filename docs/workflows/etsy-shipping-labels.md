# Etsy Shipping Label Workflow

This workflow reads an Etsy order and creates a one-page A4 PDF matching the established MiniTankForge shipping-label layout. It is read-only: it does not mark an order shipped, add tracking, or change Etsy data.

## What the label contains

1. The customer name and shipping address in the large box on the left. Names are capitalized when Etsy supplies them in all lowercase or uppercase, while intentional mixed capitalization is preserved.
2. A customer phone number, when supplied as part of the shipping address, appears beneath the address in a slightly smaller font.
3. The MiniTankForge return address in a compact crossed-out box to its right.
4. Orders with multiple tanks use a short description such as `Tenkici: 1:180, 7 tanks, coated`. List all selected scales for mixed-scale orders. Use `coated`, `uncoated`, or `coated-uncoated mix` based on the selected finishes. Count physical models across the order by multiplying each pack's contents by its quantity.
5. Etsy VAT number and order value only when `country_iso` is `GB` or `UK`.

The default sender address and Etsy UK VAT number reproduce the supplied example. Override them in `.env.etsy.local` if they change:

```text
ETSY_UK_VAT_NUMBER=370 6004 28
SHIPPING_SENDER_NAME=Davorin Kunst
SHIPPING_SENDER_LINE1=Katanciceva 32
SHIPPING_SENDER_CITY=10430 Samobor
SHIPPING_SENDER_COUNTRY=Croatia
```

## Etsy access

The existing Etsy toolkit provides OAuth setup and token refresh. The token must include `transactions_r`. Run these once if Etsy access has not already been connected or if the scope changes:

```powershell
node scripts/etsy/etsy-api.mjs auth
node scripts/etsy/etsy-api.mjs check
```

Etsy notes that shipping-address fields can depend on the app's approved access in some regions. The label command refuses to print when Etsy returns an incomplete address.

## Find the order

List the newest paid, unshipped, non-cancelled receipts:

```powershell
node scripts/etsy/shipping-label.mjs recent --limit 25
```

The output includes each receipt ID, customer name, country, value, and items. This request does not change Etsy.

## Create a printable PDF

```powershell
node scripts/etsy/shipping-label.mjs label RECEIPT_ID
```

The PDF is written to `output/shipping-labels/etsy-RECEIPT_ID.pdf`. A normalized private source record is saved under `.etsy-private/shipping-labels/` so the printed values can be audited without storing customer data in Git.

Optional overrides:

```powershell
node scripts/etsy/shipping-label.mjs label RECEIPT_ID --description "Lone Sherman Full Pack Base coat"
node scripts/etsy/shipping-label.mjs label RECEIPT_ID --phone "+39 324 681 2614"
node scripts/etsy/shipping-label.mjs label RECEIPT_ID --value 18.79 --currency GBP
node scripts/etsy/shipping-label.mjs label RECEIPT_ID --output "output/shipping-labels/custom-name.pdf"
```

Etsy Shop Manager can display a buyer phone number that is omitted from the Etsy API receipt response. By default, use only the API address and do not open Shop Manager or assume that a phone number exists. Only when the user explicitly says an order has a phone number, open that order's **Ship to** panel in Shop Manager, retrieve the number, and pass it with `--phone`. The number is printed beneath the address in a smaller font.

If a summarized order has a pack whose contents cannot be verified, the workflow stops instead of guessing. Check the listing or packing list and supply the verified total for the whole order:

```powershell
node scripts/etsy/shipping-label.mjs label RECEIPT_ID --models 37
node scripts/etsy/shipping-label.mjs batch RECEIPT_ID_1 RECEIPT_ID_2 --models "RECEIPT_ID_2=37"
```

Shipments from an EU sender to Northern Ireland omit the Etsy UK VAT block. When the label includes that block, the package value must be in GBP. If Etsy returns the amount in the shop currency, copy the exact GBP package value shown in Etsy Shop Manager and provide it explicitly:

```powershell
node scripts/etsy/shipping-label.mjs label RECEIPT_ID --value 31.03 --currency GBP
```

Do not convert the shop-currency receipt total independently. Use Etsy's displayed GBP package value so the printed amount matches the order instructions.

## Print multiple orders on one page

Batch labels use compact horizontal rows, with the sender address and UK-only VAT/value box to the right of the customer address. Up to four orders fit on one A4 page, separated by dashed cut lines:

```powershell
node scripts/etsy/shipping-label.mjs batch RECEIPT_ID_1 RECEIPT_ID_2
```

For batch labels, assign Shop Manager phone numbers to their receipt IDs. Multiple assignments can be separated by commas:

```powershell
node scripts/etsy/shipping-label.mjs batch RECEIPT_ID_1 RECEIPT_ID_2 --phone "RECEIPT_ID_2=+39 324 681 2614"
```

If one or both are UK orders whose GBP package values are not returned by the API, provide the exact Etsy-displayed values as receipt assignments:

```powershell
node scripts/etsy/shipping-label.mjs batch RECEIPT_ID_1 RECEIPT_ID_2 --gbp RECEIPT_ID_2=31.03
```

More than four receipts are supported and continue onto additional pages at four labels per page.

The renderer needs Python with `reportlab`. Codex uses the bundled document runtime automatically by setting `ETSY_LABEL_PYTHON`. For manual use, install `reportlab` in the selected Python environment or set `ETSY_LABEL_PYTHON` to an existing compatible interpreter.

## Test run from the supplied example

The supplied customer example is stored only in the ignored private fixture `.etsy-private/shipping-label-test-order.json` and is never committed.

```powershell
node scripts/etsy/shipping-label.mjs test
```

Because the example destination is Canada, the test deliberately omits Etsy VAT and value. Those two lines appear only for UK destinations.

## Reusable request

```text
Use docs/workflows/etsy-shipping-labels.md. Find my newest paid unshipped Etsy orders using the API, identify receipt [ID or customer name], and create the printable shipping-label PDF. Do not open Shop Manager or assume a phone number exists unless I explicitly say the order has one; in that case, retrieve it from the order's Ship to panel and include it. Do not change the Etsy order. Show me the PDF and flag any missing or ambiguous address, requested phone number, description, VAT, currency, or value instead of guessing.
```
