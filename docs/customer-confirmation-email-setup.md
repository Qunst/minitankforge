# Direct requests and order email

Requests & Questions posts to `/api/requests`. The Request Basket posts to `/api/order-requests`. The Worker saves the submission and its email jobs together in the private `minitankforge-requests` D1 database before showing the visitor a request reference. Resend sends the owner email with the visitor's email as Reply-To. Basket customers also receive their own confirmation with the selected items and shipping address.

## One-time Resend setup

1. Create a free Resend account.
2. Add and verify the sending subdomain `mail.minitankforge.com`. Using a subdomain keeps transactional-email DNS and reputation separate from the root domain and the existing Cloudflare Email Routing setup.
3. Create an API key with **Sending access** restricted to that verified domain. Name it `MiniTankForge production`.
4. Store the key as the encrypted Cloudflare Worker secret `RESEND_API_KEY`. Do not add the key to `wrangler.jsonc`, Git, or chat.

From this repository, the secret can be entered without placing it in shell history:

```powershell
npx wrangler secret put RESEND_API_KEY
```

Wrangler prompts for the value privately. The non-secret sender settings are already in `wrangler.jsonc`:

- From: `MiniTankForge <orders@mail.minitankforge.com>`
- Reply-To: `quali3dprint@gmail.com`

Before the first deploy, run `npx wrangler d1 migrations apply REQUESTS_DB --remote`. Wrangler generates the server catalog from the existing site data and pricing rules as part of its build.

## Local validation

Use `npx wrangler d1 migrations apply REQUESTS_DB --local` and `npx wrangler dev` to exercise the forms locally. With no Resend key configured, local requests are saved and email jobs remain pending. Use the mocked tests below to exercise email success and failure without sending real mail.

The handler's unit checks do not send real email:

```powershell
npm run test:order-confirmation
```

## Operational notes

- The API key is server-side only and should remain a sending-only, domain-restricted key.
- The Worker attempts email delivery after saving. A scheduled job checks every five minutes and retries pending messages at least ten minutes after the previous attempt. Jobs stop after six attempts or twenty hours. A stable Resend idempotency key deduplicates each email during that window.
- To recover a submission, open Cloudflare → **D1** → **minitankforge-requests** → **Console** and look up its reference, or list the most recent requests. Keep customer details within your account.

```sql
SELECT request_id, kind, subject, datetime(created_at, 'unixepoch') AS received_utc
FROM requests ORDER BY created_at DESC LIMIT 20;

SELECT details FROM requests WHERE request_id = 'REPLACE-WITH-REQUEST-ID';

SELECT request_id, audience, attempts, last_error
FROM request_notifications WHERE accepted_at IS NULL
ORDER BY next_attempt_at DESC LIMIT 20;
```

An accepted timestamp means Resend accepted the email for delivery. Check the Resend Logs for delivery or bounce status using the stored provider ID.

## Workbench import

The protected GET endpoint at /api/workbench/orders reads saved basket orders in database sequence. It requires the Worker secret WORKBENCH_IMPORT_TOKEN. The same private token and endpoint URL are configured in Workshop/.etsy-private/shop-workbench/site-orders.json on the shop PC. Keep this file private.

Workbench checks at startup and every minute while its server runs. Orders arrive in Drafts with payment set to Waiting for payment. Structured payloads preserve the basket selections and shipping fields. Earlier records use the saved server-generated summary. A failed import retries automatically and keeps its last committed cursor.

Deleting an order requires confirmation. Workbench remembers its ID locally so future imports skip it. The site database retains its saved requests after import or local deletion.
