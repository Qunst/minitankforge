# Customer confirmation email setup

The request basket continues sending the owner notification through Formspree. After Formspree accepts it, the browser calls the same-site `/api/order-confirmation` Worker route. That route sends the customer a fixed MiniTankForge confirmation through Resend. A Resend failure never retries the Formspree submission, so it cannot duplicate the owner's order notification.

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

After the domain is verified and the secret exists, deploy normally with Wrangler. The Worker serves `/api/order-confirmation`; all regular site files continue to use Cloudflare static assets.

## Local validation

Copy `.dev.vars.example` to `.dev.vars`, replace the placeholder with a Resend test key, and run the site through `wrangler dev`. `.dev.vars` is ignored by Git.

The handler's unit checks do not send real email:

```powershell
npm run test:order-confirmation
```

## Operational notes

- The API key is server-side only and should remain a sending-only, domain-restricted key.
- Resend idempotency prevents the same request ID from generating duplicate confirmation emails for 24 hours.
- The endpoint only accepts same-origin JSON requests and validates field sizes, email format, and MiniTankForge request IDs.
- If automated abuse reaches the endpoint despite these checks, add Cloudflare Turnstile or a rate-limit rule before increasing Resend quotas.
