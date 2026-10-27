#!/usr/bin/env node

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import process from "node:process";

const ROOT = resolve(import.meta.dirname, "../..");
const ENV_FILE = join(ROOT, ".env.etsy.local");
const PRIVATE_DIR = join(ROOT, ".etsy-private");
const TOKEN_FILE = join(PRIVATE_DIR, "oauth-token.json");
const SHOP_FILE = join(PRIVATE_DIR, "shop.json");
const BACKUP_DIR = join(PRIVATE_DIR, "backups");
const API_BASE = "https://api.etsy.com/v3/application";
const TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";
const DEFAULT_SCOPES = [
  "listings_r",
  "listings_w",
  "shops_r",
  "shops_w",
  "transactions_r",
];

function fail(message, details) {
  console.error(`\nError: ${message}`);
  if (details) console.error(details);
  process.exitCode = 1;
}

function parseEnv(source) {
  const values = {};
  for (const rawLine of source.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

async function loadConfig() {
  if (!existsSync(ENV_FILE)) {
    throw new Error(`Missing ${ENV_FILE}`);
  }

  const envSource = await readFile(ENV_FILE, "utf8");
  const fileValues = parseEnv(envSource);
  const bareValues = envSource
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  if (!fileValues.ETSY_API_KEYSTRING && !fileValues.ETSY_SHARED_SECRET && bareValues.length === 2) {
    [fileValues.ETSY_API_KEYSTRING, fileValues.ETSY_SHARED_SECRET] = bareValues;
  }
  const config = {
    keystring: process.env.ETSY_API_KEYSTRING || fileValues.ETSY_API_KEYSTRING,
    sharedSecret: process.env.ETSY_SHARED_SECRET || fileValues.ETSY_SHARED_SECRET,
    redirectUri:
      process.env.ETSY_REDIRECT_URI ||
      fileValues.ETSY_REDIRECT_URI ||
      "http://localhost:3003/oauth/redirect",
    scopes: (
      process.env.ETSY_SCOPES ||
      fileValues.ETSY_SCOPES ||
      DEFAULT_SCOPES.join(" ")
    )
      .split(/[\s,]+/)
      .filter(Boolean),
  };

  const missing = [];
  if (!config.keystring) missing.push("ETSY_API_KEYSTRING");
  if (!config.sharedSecret) missing.push("ETSY_SHARED_SECRET");
  if (missing.length) {
    throw new Error(`Missing ${missing.join(" and ")} in ${ENV_FILE}`);
  }

  return config;
}

function apiKey(config) {
  return `${config.keystring}:${config.sharedSecret}`;
}

function base64Url(buffer) {
  return buffer.toString("base64url");
}

async function writeJsonAtomic(file, value) {
  await mkdir(dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temp, file);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function readResponse(response) {
  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Retain the original response body for useful diagnostics.
  }

  if (!response.ok) {
    const detail = typeof body === "string" ? body : JSON.stringify(body, null, 2);
    throw new Error(`Etsy returned HTTP ${response.status} ${response.statusText}\n${detail}`);
  }
  return body;
}

async function requestToken(config, parameters) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(parameters),
  });
  const token = await readResponse(response);
  token.obtained_at = Math.floor(Date.now() / 1000);
  await writeJsonAtomic(TOKEN_FILE, token);
  return token;
}

async function refreshToken(config, current) {
  if (!current.refresh_token) throw new Error("Saved token has no refresh token. Run auth again.");
  return requestToken(config, {
    grant_type: "refresh_token",
    client_id: config.keystring,
    refresh_token: current.refresh_token,
  });
}

async function accessToken(config) {
  if (!existsSync(TOKEN_FILE)) {
    throw new Error("No OAuth token found. Run: node scripts/etsy/etsy-api.mjs auth");
  }
  let token = await readJson(TOKEN_FILE);
  const expiresAt = Number(token.obtained_at || 0) + Number(token.expires_in || 0);
  if (!token.access_token || Date.now() / 1000 >= expiresAt - 120) {
    token = await refreshToken(config, token);
    console.log("OAuth access token refreshed.");
  }
  return token.access_token;
}

async function api(config, path, { query, method = "GET", body, form } = {}) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  const headers = {
      authorization: `Bearer ${await accessToken(config)}`,
      "x-api-key": apiKey(config),
  };
  let requestBody;
  if (body !== undefined) {
    headers["content-type"] = "application/json";
    requestBody = JSON.stringify(body);
  } else if (form !== undefined) {
    headers["content-type"] = "application/x-www-form-urlencoded";
    const parameters = new URLSearchParams();
    for (const [key, value] of Object.entries(form)) {
      if (value === undefined || value === null || value === "") continue;
      parameters.set(key, Array.isArray(value) ? value.join(",") : String(value));
    }
    requestBody = parameters;
  }
  const response = await fetch(url, {
    method,
    headers,
    body: requestBody,
  });
  return readResponse(response);
}

async function apiMultipart(config, path, fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    if (value?.filePath) {
      const bytes = await readFile(value.filePath);
      form.append(key, new Blob([bytes], { type: value.mimeType || "application/octet-stream" }), basename(value.filePath));
    } else {
      form.append(key, String(value));
    }
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${await accessToken(config)}`,
      "x-api-key": apiKey(config),
    },
    body: form,
  });
  return readResponse(response);
}

async function commandPing(config) {
  const response = await fetch(`${API_BASE}/openapi-ping`, {
    headers: { "x-api-key": apiKey(config) },
  });
  const body = await readResponse(response);
  console.log("Etsy API key is active.");
  if (body?.application_id) console.log(`Application ID: ${body.application_id}`);
}

async function commandAuth(config) {
  const redirect = new URL(config.redirectUri);
  if (redirect.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(redirect.hostname)) {
    throw new Error("ETSY_REDIRECT_URI must be a local http://localhost or 127.0.0.1 URL.");
  }

  const verifier = base64Url(randomBytes(48));
  const challenge = base64Url(createHash("sha256").update(verifier).digest());
  const state = base64Url(randomBytes(24));
  const authorize = new URL("https://www.etsy.com/oauth/connect");
  authorize.search = new URLSearchParams({
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    client_id: config.keystring,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();

  await mkdir(PRIVATE_DIR, { recursive: true });

  const server = createServer(async (request, response) => {
    try {
      const callback = new URL(request.url, config.redirectUri);
      if (callback.pathname !== redirect.pathname) {
        response.writeHead(404).end("Not found");
        return;
      }
      if (callback.searchParams.get("error")) {
        throw new Error(callback.searchParams.get("error_description") || callback.searchParams.get("error"));
      }
      const returnedState = callback.searchParams.get("state") || "";
      const expected = Buffer.from(state);
      const actual = Buffer.from(returnedState);
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        throw new Error("OAuth state did not match. Authorization was stopped for safety.");
      }
      const code = callback.searchParams.get("code");
      if (!code) throw new Error("Etsy did not return an authorization code.");

      await requestToken(config, {
        grant_type: "authorization_code",
        client_id: config.keystring,
        redirect_uri: config.redirectUri,
        code,
        code_verifier: verifier,
      });
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("Etsy authorization succeeded. You can close this browser tab.");
      console.log("\nOAuth authorization succeeded. Token saved outside Git.");
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(`Authorization failed: ${error.message}`);
      fail("OAuth authorization failed.", error.message);
    } finally {
      setTimeout(() => server.close(), 100);
    }
  });

  server.on("error", (error) => fail("Could not start the OAuth callback server.", error.message));
  server.listen(Number(redirect.port || 80), redirect.hostname, () => {
    console.log(`OAuth callback server listening at ${config.redirectUri}`);
    console.log("\nOpen this URL in your browser and approve access:\n");
    console.log(authorize.toString());
    console.log("\nWaiting for Etsy's redirect...");
  });
}

async function getIdentity(config) {
  const me = await api(config, "/users/me");
  const shop = await api(config, `/users/${me.user_id}/shops`);
  await writeJsonAtomic(SHOP_FILE, {
    fetched_at: new Date().toISOString(),
    user_id: me.user_id,
    shop_id: shop.shop_id,
    shop_name: shop.shop_name,
  });
  return { me, shop };
}

async function commandCheck(config) {
  const { me, shop } = await getIdentity(config);
  console.log("OAuth connection verified.");
  console.log(`Shop: ${shop.shop_name}`);
  console.log(`Shop ID: ${shop.shop_id}`);
  console.log(`User ID: ${me.user_id}`);
  console.log(`Granted scopes: ${(await readJson(TOKEN_FILE)).scope || "not returned"}`);
  console.log("No Etsy data was changed.");
}

async function getShopId(config) {
  if (existsSync(SHOP_FILE)) {
    const saved = await readJson(SHOP_FILE);
    if (saved.shop_id) return saved.shop_id;
  }
  return (await getIdentity(config)).shop.shop_id;
}

async function commandListings(config, state = "active") {
  const allowed = new Set(["active", "inactive", "sold_out", "draft", "expired"]);
  if (!allowed.has(state)) throw new Error(`Invalid listing state: ${state}`);
  const shopId = await getShopId(config);
  const listings = [];
  let offset = 0;
  while (true) {
    const page = await api(config, `/shops/${shopId}/listings`, {
      query: { state, limit: 100, offset },
    });
    listings.push(...(page.results || []));
    offset += page.results?.length || 0;
    if (!page.results?.length || offset >= Number(page.count || 0)) break;
  }
  console.log(JSON.stringify({ state, count: listings.length, results: listings.map((item) => ({
    listing_id: item.listing_id,
    title: item.title,
    state: item.state,
    quantity: item.quantity,
    price: item.price,
    url: item.url,
  })) }, null, 2));
}

async function allShopListings(config, shopId, state) {
  const listings = [];
  let offset = 0;
  while (true) {
    const page = await api(config, `/shops/${shopId}/listings`, {
      query: { state, limit: 100, offset },
    });
    listings.push(...(page.results || []));
    offset += page.results?.length || 0;
    if (!page.results?.length || offset >= Number(page.count || 0)) break;
  }
  return listings;
}

async function commandBackup(config, listingId) {
  if (!/^\d+$/.test(listingId || "")) throw new Error("backup requires a numeric Etsy listing ID.");
  const shopId = await getShopId(config);
  const [listing, inventory] = await Promise.all([
    api(config, `/listings/${listingId}`, { query: { includes: "Images,Videos" } }),
    api(config, `/listings/${listingId}/inventory`),
  ]);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = join(BACKUP_DIR, `${listingId}-${timestamp}.json`);
  await writeJsonAtomic(file, {
    schema_version: 1,
    fetched_at: new Date().toISOString(),
    shop_id: shopId,
    listing,
    inventory,
  });
  console.log(`Read-only backup saved: ${file}`);
  console.log(`Products/variants: ${inventory.products?.length || 0}`);
  console.log("No Etsy data was changed.");
}

async function commandAuditListing(config, listingId) {
  if (!/^\d+$/.test(listingId || "")) throw new Error("audit-listing requires a numeric Etsy listing ID.");
  const shopId = await getShopId(config);
  const [listing, inventory, properties, variationImages] = await Promise.all([
    api(config, `/listings/${listingId}`, { query: { includes: "Images" } }),
    api(config, `/listings/${listingId}/inventory`),
    api(config, `/shops/${shopId}/listings/${listingId}/properties`),
    api(config, `/shops/${shopId}/listings/${listingId}/variation-images`),
  ]);
  console.log(JSON.stringify({
    listing_id: listing.listing_id,
    state: listing.state,
    title: listing.title,
    quantity: listing.quantity,
    materials: listing.materials,
    images: (listing.images || []).map((image) => ({
      listing_image_id: image.listing_image_id,
      rank: image.rank,
      alt_text: image.alt_text,
    })),
    properties: properties.results || properties,
    inventory_values: inventory.products
      .flatMap((product) => product.property_values)
      .map((property) => ({
        property_id: property.property_id,
        property_name: property.property_name,
        value_id: property.value_ids?.[0],
        value: property.values?.[0],
      }))
      .filter((value, index, values) =>
        values.findIndex((candidate) => JSON.stringify(candidate) === JSON.stringify(value)) === index,
      ),
    variation_images: variationImages.results || variationImages,
  }, null, 2));
}

function inventoryPayload(inventory, propertyName, replacements) {
  const replacementCounts = new Map([...replacements.keys()].map((value) => [value, 0]));
  const products = inventory.products.map((product) => ({
    sku: product.sku || "",
    property_values: product.property_values.map((property) => {
      const values = property.values.map((value) => {
        if (property.property_name !== propertyName || !replacements.has(value)) return value;
        replacementCounts.set(value, replacementCounts.get(value) + 1);
        return replacements.get(value);
      });
      const changed = values.some((value, index) => value !== property.values[index]);
      const output = {
        property_id: property.property_id,
        property_name: property.property_name,
        values,
      };
      if (!changed && property.value_ids?.length) output.value_ids = property.value_ids;
      if (property.scale_id != null) output.scale_id = property.scale_id;
      return output;
    }),
    offerings: product.offerings.map((offering) => ({
      price: Number(offering.price.amount) / Number(offering.price.divisor),
      quantity: offering.quantity,
      is_enabled: offering.is_enabled,
      ...(offering.readiness_state_id == null
        ? {}
        : { readiness_state_id: offering.readiness_state_id }),
    })),
  }));

  for (const [source, count] of replacementCounts) {
    if (count === 0) throw new Error(`Value not found under ${propertyName}: ${source}`);
  }

  return {
    payload: {
      products,
      price_on_property: inventory.price_on_property || [],
      quantity_on_property: inventory.quantity_on_property || [],
      sku_on_property: inventory.sku_on_property || [],
    },
    replacementCounts,
  };
}

function canonicalInventory(inventory) {
  const products = inventory.products.map((product) => ({
    sku: product.sku || "",
    properties: product.property_values
      .map((property) => ({
        property_id: property.property_id,
        property_name: property.property_name,
        values: [...property.values],
      }))
      .sort((a, b) => a.property_id - b.property_id),
    offerings: product.offerings
      .map((offering) => ({
        quantity: offering.quantity,
        is_enabled: offering.is_enabled,
        price: `${offering.price.amount}/${offering.price.divisor}/${offering.price.currency_code}`,
        readiness_state_id: offering.readiness_state_id ?? null,
      }))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  }));
  products.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return {
    products,
    price_on_property: [...(inventory.price_on_property || [])].sort((a, b) => a - b),
    quantity_on_property: [...(inventory.quantity_on_property || [])].sort((a, b) => a - b),
    sku_on_property: [...(inventory.sku_on_property || [])].sort((a, b) => a - b),
  };
}

function expectedInventoryFromPayload(payload, currencyCode) {
  return canonicalInventory({
    ...payload,
    products: payload.products.map((product) => ({
      ...product,
      offerings: product.offerings.map((offering) => ({
        ...offering,
        price: {
          amount: Math.round(Number(offering.price) * 100),
          divisor: 100,
          currency_code: currencyCode,
        },
      })),
    })),
  });
}

function summarizeInventory(inventory) {
  const offerings = inventory.products.flatMap((product) => product.offerings || []);
  return {
    products: inventory.products.length,
    offerings: offerings.length,
    enabled_offerings: offerings.filter((offering) => offering.is_enabled).length,
    unique_prices: new Set(
      offerings.map((offering) =>
        typeof offering.price === "number"
          ? offering.price.toFixed(2)
          : `${offering.price.amount}/${offering.price.divisor}`,
      ),
    ).size,
  };
}

function cloneInventoryPayload(inventory) {
  return {
    products: inventory.products.map((product) => ({
      sku: product.sku || "",
      property_values: product.property_values.map((property) => ({
        property_id: property.property_id,
        property_name: property.property_name,
        values: [...property.values],
        ...(property.scale_id == null ? {} : { scale_id: property.scale_id }),
      })),
      offerings: product.offerings.map((offering) => ({
        price: Number(offering.price.amount) / Number(offering.price.divisor),
        quantity: offering.quantity,
        is_enabled: offering.is_enabled,
        ...(offering.readiness_state_id == null
          ? {}
          : { readiness_state_id: offering.readiness_state_id }),
      })),
    })),
    price_on_property: inventory.price_on_property || [],
    quantity_on_property: inventory.quantity_on_property || [],
    sku_on_property: inventory.sku_on_property || [],
  };
}

function validateDraftPlan(plan) {
  const required = ["slug", "template_listing_id", "title", "description", "tags", "images"];
  for (const key of required) {
    if (plan[key] === undefined || plan[key] === null || plan[key] === "") {
      throw new Error(`Draft plan is missing: ${key}`);
    }
  }
  if (!/^\d+$/.test(String(plan.template_listing_id))) {
    throw new Error("template_listing_id must be numeric.");
  }
  if (plan.title.length > 140) throw new Error(`Title is ${plan.title.length} characters; Etsy allows 140.`);
  const restrictedTitleChars = [...plan.title].filter((character) => "%:&+".includes(character));
  for (const character of new Set(restrictedTitleChars)) {
    if (restrictedTitleChars.filter((value) => value === character).length > 1) {
      throw new Error(`Title contains ${character} more than once.`);
    }
  }
  if (!Array.isArray(plan.tags) || plan.tags.length !== 13) {
    throw new Error("Draft plan must contain exactly 13 tags.");
  }
  for (const tag of plan.tags) {
    if (tag.length > 20) throw new Error(`Tag is longer than 20 characters: ${tag}`);
  }
  if (!Array.isArray(plan.images) || plan.images.length === 0 || plan.images.length > 20) {
    throw new Error("Draft plan must contain 1-20 images.");
  }
  for (const image of plan.images) {
    const file = resolve(ROOT, image.path);
    if (!existsSync(file)) throw new Error(`Image not found: ${file}`);
    if (image.alt_text && image.alt_text.length > 500) throw new Error(`Image alt text exceeds 500 characters: ${image.path}`);
  }
}

function validateCompleteDraftPlan(plan) {
  validateDraftPlan(plan);
  if (!Number.isInteger(plan.quantity) || plan.quantity < 1) {
    throw new Error("Draft plan quantity must be a positive integer.");
  }
  if (!plan.attributes?.material || !plan.attributes?.scale) {
    throw new Error("Draft plan must include attributes.material and attributes.scale.");
  }
  if (
    !plan.variation_images?.property_name ||
    !plan.variation_images?.base_coated_image ||
    !plan.variation_images?.unpainted_image
  ) {
    throw new Error("Draft plan must include complete variation_images configuration.");
  }
  const imagePaths = new Set(plan.images.map((image) => image.path));
  if (!imagePaths.has(plan.variation_images.base_coated_image)) {
    throw new Error("base_coated_image must reference an image in the plan.");
  }
  if (!imagePaths.has(plan.variation_images.unpainted_image)) {
    throw new Error("unpainted_image must reference an image in the plan.");
  }
}

async function commandCreateDraft(config, args) {
  const apply = args.includes("--apply");
  const values = args.filter((value) => value !== "--apply");
  const [planPath] = values;
  if (!planPath) throw new Error("Usage: create-draft <plan.json> [--apply]");
  const absolutePlanPath = resolve(ROOT, planPath);
  const plan = await readJson(absolutePlanPath);
  validateDraftPlan(plan);

  const shopId = await getShopId(config);
  const [templateListing, templateInventory, activeListings, draftListings] = await Promise.all([
    api(config, `/listings/${plan.template_listing_id}`),
    api(config, `/listings/${plan.template_listing_id}/inventory`),
    allShopListings(config, shopId, "active"),
    allShopListings(config, shopId, "draft"),
  ]);
  const normalizedNeedle = plan.title.toLocaleLowerCase();
  const duplicate = [...activeListings, ...draftListings].find(
    (listing) => listing.title?.toLocaleLowerCase() === normalizedNeedle,
  );
  if (duplicate) {
    throw new Error(`A listing with this exact title already exists: ${duplicate.listing_id} (${duplicate.state})`);
  }
  if (templateListing.state !== "active") throw new Error("Template listing is not active.");
  if (templateInventory.products?.length !== 30) {
    throw new Error(`Expected 30 template products; found ${templateInventory.products?.length || 0}.`);
  }
  const packLabels = new Set(
    templateInventory.products
      .flatMap((product) => product.property_values)
      .filter((property) => property.property_name === "Pack size")
      .flatMap((property) => property.values),
  );
  for (const expected of ["1 tank", "5 tanks", "10 tanks"]) {
    if (!packLabels.has(expected)) throw new Error(`Template is missing pack label: ${expected}`);
  }

  const inventoryPayload = cloneInventoryPayload(templateInventory);
  const inventorySummary = summarizeInventory(templateInventory);
  const minimumPrice = Math.min(
    ...templateInventory.products.flatMap((product) =>
      product.offerings.map((offering) => Number(offering.price.amount) / Number(offering.price.divisor)),
    ),
  );
  const quantity = Math.max(
    ...templateInventory.products.flatMap((product) => product.offerings.map((offering) => offering.quantity)),
  );
  const form = {
    quantity,
    title: plan.title,
    description: plan.description,
    price: minimumPrice,
    who_made: templateListing.who_made,
    when_made: templateListing.when_made,
    taxonomy_id: templateListing.taxonomy_id,
    shipping_profile_id: templateListing.shipping_profile_id,
    return_policy_id: templateListing.return_policy_id,
    readiness_state_id: templateListing.readiness_state_id,
    shop_section_id: templateListing.shop_section_id,
    should_auto_renew: templateListing.should_auto_renew,
    is_supply: templateListing.is_supply,
    type: "physical",
    tags: plan.tags,
    materials: plan.materials || templateListing.materials || [],
  };
  const dryRun = {
    schema_version: 1,
    created_at: new Date().toISOString(),
    mode: apply ? "apply" : "dry-run",
    shop_id: shopId,
    slug: plan.slug,
    template_listing_id: Number(plan.template_listing_id),
    draft_form: form,
    inventory_summary: inventorySummary,
    image_count: plan.images.length,
    inventory_payload_sha256: createHash("sha256").update(JSON.stringify(inventoryPayload)).digest("hex"),
  };
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dryRunFile = join(PRIVATE_DIR, "drafts", `${plan.slug}-${timestamp}-${apply ? "apply" : "dry-run"}.json`);
  await writeJsonAtomic(dryRunFile, dryRun);

  console.log(`${apply ? "Validated draft creation" : "Draft dry run"}: ${plan.title}`);
  console.log(`Template: ${templateListing.title} (${plan.template_listing_id})`);
  console.log(`Inventory: ${inventorySummary.products} products, ${inventorySummary.enabled_offerings} enabled offerings, ${inventorySummary.unique_prices} unique prices.`);
  console.log(`Images: ${plan.images.length}; tags: ${plan.tags.length}; initial price: ${minimumPrice.toFixed(2)} EUR.`);
  console.log(`Plan record: ${dryRunFile}`);
  if (!apply) {
    console.log("No Etsy data was changed. Add --apply to create and populate the draft.");
    return { listingId: null, planPath };
  }

  const created = await api(config, `/shops/${shopId}/listings`, {
    method: "POST",
    form,
  });
  const listingId = created.listing_id;
  if (!listingId) throw new Error("Etsy created a draft but did not return a listing ID.");
  console.log(`Draft created: ${listingId}`);

  await api(config, `/listings/${listingId}/inventory`, {
    method: "PUT",
    body: inventoryPayload,
  });
  console.log("Variation inventory uploaded.");

  const uploadedImages = [];
  for (let index = 0; index < plan.images.length; index += 1) {
    const image = plan.images[index];
    const filePath = resolve(ROOT, image.path);
    const uploaded = await apiMultipart(config, `/shops/${shopId}/listings/${listingId}/images`, {
      image: { filePath, mimeType: "image/jpeg" },
      rank: index + 1,
      overwrite: false,
      is_watermarked: false,
      alt_text: image.alt_text || `${plan.title} view ${index + 1}`,
    });
    uploadedImages.push(uploaded.listing_image_id);
    console.log(`Uploaded image ${index + 1}/${plan.images.length}: ${basename(filePath)}`);
  }

  const [verifiedListing, verifiedInventory] = await Promise.all([
    api(config, `/listings/${listingId}`, { query: { includes: "Images" } }),
    api(config, `/listings/${listingId}/inventory`),
  ]);
  const currencyCode = templateInventory.products[0].offerings[0].price.currency_code;
  const expectedInventory = expectedInventoryFromPayload(inventoryPayload, currencyCode);
  const actualInventory = canonicalInventory(verifiedInventory);
  const errors = [];
  if (verifiedListing.state !== "draft") errors.push(`state is ${verifiedListing.state}, not draft`);
  if (verifiedListing.title !== plan.title) errors.push("title mismatch");
  if (verifiedListing.description !== plan.description) errors.push("description mismatch");
  if (JSON.stringify([...(verifiedListing.tags || [])].sort()) !== JSON.stringify([...plan.tags].sort())) errors.push("tag mismatch");
  if ((verifiedListing.images || []).length !== plan.images.length) errors.push(`image count is ${(verifiedListing.images || []).length}`);
  if (JSON.stringify(actualInventory) !== JSON.stringify(expectedInventory)) errors.push("inventory mismatch");

  const resultFile = join(PRIVATE_DIR, "drafts", `${plan.slug}-${listingId}-verified.json`);
  await writeJsonAtomic(resultFile, {
    schema_version: 1,
    verified_at: new Date().toISOString(),
    listing_id: listingId,
    state: verifiedListing.state,
    title: verifiedListing.title,
    tags: verifiedListing.tags,
    image_ids: uploadedImages,
    inventory_summary: summarizeInventory(verifiedInventory),
    errors,
  });
  if (errors.length) {
    throw new Error(`Draft ${listingId} was created but verification failed: ${errors.join(", ")}. Inspect ${resultFile}.`);
  }
  console.log("Draft verification succeeded: title, description, 13 tags, 6 images, and complete inventory match.");
  console.log(`Edit draft: https://www.etsy.com/your/shops/me/listing-editor/edit/${listingId}`);
  console.log(`Verification record: ${resultFile}`);
  return { listingId, planPath };
}

async function commandCreateCompleteDraft(config, args) {
  const apply = args.includes("--apply");
  const values = args.filter((value) => value !== "--apply");
  const [planPath] = values;
  if (!planPath) throw new Error("Usage: create-complete-draft <plan.json> [--apply]");
  const plan = await readJson(resolve(ROOT, planPath));
  validateCompleteDraftPlan(plan);

  const result = await commandCreateDraft(config, args);
  if (!apply) {
    console.log("Complete-draft fields also validated: quantity, attributes, and variation-image configuration.");
    return;
  }
  await commandUpdateDraft(config, [String(result.listingId), planPath, "--apply"]);
  console.log(`Complete unpublished draft is ready for manual Etsy review: ${result.listingId}`);
}

async function commandUpdateDraft(config, args) {
  const apply = args.includes("--apply");
  const values = args.filter((value) => value !== "--apply");
  const [listingId, planPath] = values;
  if (!/^\d+$/.test(listingId || "") || !planPath) {
    throw new Error("Usage: update-draft <listing-id> <plan.json> [--apply]");
  }

  const plan = await readJson(resolve(ROOT, planPath));
  validateCompleteDraftPlan(plan);

  const shopId = await getShopId(config);
  const listing = await api(config, `/listings/${listingId}`, { query: { includes: "Images" } });
  if (listing.state !== "draft") throw new Error(`Refusing to update listing ${listingId}: state is ${listing.state}.`);
  const inventory = await api(config, `/listings/${listingId}/inventory`);
  const currentPropertiesResponse = await api(config, `/shops/${shopId}/listings/${listingId}/properties`);
  const currentVariationImagesResponse = await api(config, `/shops/${shopId}/listings/${listingId}/variation-images`);
  const templatePropertiesResponse = await api(
    config,
    `/shops/${shopId}/listings/${plan.template_listing_id}/properties`,
  );
  const templateProperties = templatePropertiesResponse.results || templatePropertiesResponse;

  const desiredImageIds = plan.images.map((image) => {
    const match = (listing.images || []).find((candidate) => candidate.alt_text === image.alt_text);
    if (!match) throw new Error(`Could not match existing Etsy image by alt text: ${image.alt_text}`);
    return match.listing_image_id;
  });
  if (new Set(desiredImageIds).size !== plan.images.length) {
    throw new Error("Image matching did not produce six unique Etsy image IDs.");
  }

  const materialProperty = templateProperties.find((property) =>
    property.values?.includes(plan.attributes.material),
  );
  const scaleProperty = templateProperties.find((property) =>
    property.values?.includes(plan.attributes.scale),
  );
  if (!materialProperty || !scaleProperty) {
    throw new Error("The template does not contain the requested Resin and 1:160 structured attributes.");
  }
  const selectPropertyValue = (property, requestedValue) => {
    const index = property.values.indexOf(requestedValue);
    return {
      property_id: property.property_id,
      form: {
        value_ids: [property.value_ids[index]],
        values: [requestedValue],
        ...(property.scale_id == null ? {} : { scale_id: property.scale_id }),
      },
    };
  };
  const materialUpdate = selectPropertyValue(materialProperty, plan.attributes.material);
  const scaleUpdate = selectPropertyValue(scaleProperty, plan.attributes.scale);

  const inventoryPayload = cloneInventoryPayload(inventory);
  for (const product of inventoryPayload.products) {
    for (const offering of product.offerings) offering.quantity = plan.quantity;
  }
  const currencyCode = inventory.products
    .flatMap((product) => product.offerings || [])
    .find((offering) => offering.price?.currency_code)?.price.currency_code;
  if (!currencyCode) throw new Error("Could not determine the listing currency.");
  const expectedInventory = expectedInventoryFromPayload(inventoryPayload, currencyCode);

  const variationPropertyValues = inventory.products
    .flatMap((product) => product.property_values)
    .filter((property) => property.property_name === plan.variation_images.property_name)
    .map((property) => ({
      property_id: property.property_id,
      value_id: property.value_ids?.[0],
      value: property.values?.[0],
    }))
    .filter((value, index, all) => value.value_id && all.findIndex((candidate) => candidate.value_id === value.value_id) === index);
  if (variationPropertyValues.length !== 10) {
    throw new Error(`Expected 10 scale/finish values; found ${variationPropertyValues.length}.`);
  }
  const variationPropertyIds = new Set(variationPropertyValues.map((value) => value.property_id));
  if (variationPropertyIds.size !== 1) throw new Error("Variation image values span more than one property.");

  const altTextForPath = (path) => plan.images.find((image) => image.path === path)?.alt_text;
  const baseAltText = altTextForPath(plan.variation_images.base_coated_image);
  const unpaintedAltText = altTextForPath(plan.variation_images.unpainted_image);
  const imageIdForAltText = (altText) =>
    (listing.images || []).find((image) => image.alt_text === altText)?.listing_image_id;
  const baseImageId = imageIdForAltText(baseAltText);
  const unpaintedImageId = imageIdForAltText(unpaintedAltText);
  if (!baseImageId || !unpaintedImageId) throw new Error("Could not resolve the two variation image IDs.");
  const variationImages = variationPropertyValues.map((property) => {
    const imageId = property.value.includes("Base coated")
      ? baseImageId
      : property.value.includes("Unpainted")
        ? unpaintedImageId
        : null;
    if (!imageId) throw new Error(`Cannot choose an image for variation value: ${property.value}`);
    return { property_id: property.property_id, value_id: property.value_id, image_id: imageId };
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const recordFile = join(PRIVATE_DIR, "drafts", `${plan.slug}-${listingId}-${timestamp}-${apply ? "apply" : "dry-run"}.json`);
  await writeJsonAtomic(recordFile, {
    schema_version: 1,
    created_at: new Date().toISOString(),
    mode: apply ? "apply" : "dry-run",
    listing_id: Number(listingId),
    image_ids: desiredImageIds,
    materials: plan.materials,
    quantity: plan.quantity,
    material_attribute: materialUpdate,
    scale_attribute: scaleUpdate,
    variation_images: variationImages,
  });
  console.log(`${apply ? "Validated update" : "Draft update dry run"}: ${listing.title} (${listingId})`);
  console.log(`Images: ${desiredImageIds.join(", ")}`);
  console.log(`Attributes: ${plan.attributes.material}; ${plan.attributes.scale}. Quantity per offering: ${plan.quantity}.`);
  console.log(`Variation images: ${variationImages.length} values mapped to two quarter-view photos.`);
  console.log(`Plan record: ${recordFile}`);
  if (!apply) {
    console.log("No Etsy data was changed. Add --apply to execute this exact transformation.");
    return;
  }

  const beforeFile = join(BACKUP_DIR, `${listingId}-${timestamp}-before-draft-update.json`);
  await writeJsonAtomic(beforeFile, {
    schema_version: 1,
    fetched_at: new Date().toISOString(),
    shop_id: shopId,
    listing,
    inventory,
    properties: currentPropertiesResponse.results || currentPropertiesResponse,
    variation_images: currentVariationImagesResponse.results || currentVariationImagesResponse,
  });

  await api(config, `/shops/${shopId}/listings/${listingId}`, {
    method: "PATCH",
    form: { image_ids: desiredImageIds, materials: plan.materials },
  });
  await api(config, `/shops/${shopId}/listings/${listingId}/properties/${materialUpdate.property_id}`, {
    method: "PUT",
    form: materialUpdate.form,
  });
  await api(config, `/shops/${shopId}/listings/${listingId}/properties/${scaleUpdate.property_id}`, {
    method: "PUT",
    form: scaleUpdate.form,
  });
  await api(config, `/listings/${listingId}/inventory`, { method: "PUT", body: inventoryPayload });
  await api(config, `/shops/${shopId}/listings/${listingId}/variation-images`, {
    method: "POST",
    body: { variation_images: variationImages },
  });

  const verifiedListing = await api(config, `/listings/${listingId}`, { query: { includes: "Images" } });
  const verifiedInventory = await api(config, `/listings/${listingId}/inventory`);
  const verifiedPropertiesResponse = await api(config, `/shops/${shopId}/listings/${listingId}/properties`);
  const verifiedVariationImagesResponse = await api(config, `/shops/${shopId}/listings/${listingId}/variation-images`);
  const verifiedProperties = verifiedPropertiesResponse.results || verifiedPropertiesResponse;
  const verifiedVariationImages = verifiedVariationImagesResponse.results || verifiedVariationImagesResponse;
  const errors = [];
  const actualImageIds = [...(verifiedListing.images || [])]
    .sort((a, b) => a.rank - b.rank)
    .map((image) => image.listing_image_id);
  if (verifiedListing.state !== "draft") errors.push(`state is ${verifiedListing.state}`);
  if (JSON.stringify(actualImageIds) !== JSON.stringify(desiredImageIds)) errors.push("image order mismatch");
  if (JSON.stringify(verifiedListing.materials || []) !== JSON.stringify(plan.materials)) errors.push("materials mismatch");
  if (JSON.stringify(canonicalInventory(verifiedInventory)) !== JSON.stringify(expectedInventory)) errors.push("inventory mismatch");
  const hasExactProperty = (update) => verifiedProperties.some((property) =>
    property.property_id === update.property_id &&
    JSON.stringify(property.value_ids) === JSON.stringify(update.form.value_ids) &&
    JSON.stringify(property.values) === JSON.stringify(update.form.values),
  );
  if (!hasExactProperty(materialUpdate)) errors.push("material attribute mismatch");
  if (!hasExactProperty(scaleUpdate)) errors.push("scale attribute mismatch");
  const canonicalVariationImages = (items) => items
    .map((item) => ({ property_id: item.property_id, value_id: item.value_id, image_id: item.image_id }))
    .sort((a, b) => a.value_id - b.value_id);
  if (
    JSON.stringify(canonicalVariationImages(verifiedVariationImages)) !==
    JSON.stringify(canonicalVariationImages(variationImages))
  ) errors.push("variation image mismatch");

  const afterFile = join(BACKUP_DIR, `${listingId}-${timestamp}-after-draft-update.json`);
  await writeJsonAtomic(afterFile, {
    schema_version: 1,
    fetched_at: new Date().toISOString(),
    shop_id: shopId,
    listing: verifiedListing,
    inventory: verifiedInventory,
    properties: verifiedProperties,
    variation_images: verifiedVariationImages,
    errors,
  });
  if (errors.length) {
    throw new Error(`Etsy accepted the draft update but verification failed: ${errors.join(", ")}. Inspect ${afterFile}.`);
  }
  console.log("Draft update succeeded and all requested fields matched on read-back.");
  console.log(`Before backup: ${beforeFile}`);
  console.log(`After backup: ${afterFile}`);
  console.log(`Edit draft: https://www.etsy.com/your/shops/me/listing-editor/edit/${listingId}`);
}

async function commandCheckListing(config, args) {
  const [listingId, planPath] = args;
  if (!/^\d+$/.test(listingId || "") || !planPath) {
    throw new Error("Usage: check-listing <listing-id> <plan.json>");
  }
  const plan = await readJson(resolve(ROOT, planPath));
  validateCompleteDraftPlan(plan);
  const shopId = await getShopId(config);
  const listing = await api(config, `/listings/${listingId}`, { query: { includes: "Images" } });
  const inventory = await api(config, `/listings/${listingId}/inventory`);
  const propertiesResponse = await api(config, `/shops/${shopId}/listings/${listingId}/properties`);
  const variationImagesResponse = await api(config, `/shops/${shopId}/listings/${listingId}/variation-images`);
  const templateListing = await api(config, `/listings/${plan.template_listing_id}`);
  const templateInventory = await api(config, `/listings/${plan.template_listing_id}/inventory`);
  const properties = propertiesResponse.results || propertiesResponse;
  const variationImages = variationImagesResponse.results || variationImagesResponse;
  const errors = [];

  if (!['draft', 'active'].includes(listing.state)) errors.push(`unexpected state: ${listing.state}`);
  if (listing.title !== plan.title) errors.push("title mismatch");
  if (listing.description !== plan.description) errors.push("description mismatch");
  if (JSON.stringify([...(listing.tags || [])].sort()) !== JSON.stringify([...plan.tags].sort())) errors.push("tag mismatch");
  if (JSON.stringify(listing.materials || []) !== JSON.stringify(plan.materials || [])) errors.push("materials mismatch");

  const actualImages = [...(listing.images || [])].sort((a, b) => a.rank - b.rank);
  if (actualImages.length !== plan.images.length) errors.push(`image count is ${actualImages.length}`);
  if (
    JSON.stringify(actualImages.map((image) => image.alt_text)) !==
    JSON.stringify(plan.images.map((image) => image.alt_text))
  ) errors.push("image order or alt text mismatch");

  const expectedInventoryPayload = cloneInventoryPayload(templateInventory);
  for (const product of expectedInventoryPayload.products) {
    for (const offering of product.offerings) offering.quantity = plan.quantity;
  }
  const currencyCode = templateInventory.products
    .flatMap((product) => product.offerings || [])
    .find((offering) => offering.price?.currency_code)?.price.currency_code;
  if (!currencyCode) throw new Error("Could not determine the template currency.");
  const expectedInventory = expectedInventoryFromPayload(expectedInventoryPayload, currencyCode);
  if (JSON.stringify(canonicalInventory(inventory)) !== JSON.stringify(expectedInventory)) {
    errors.push("inventory, pricing, or quantity mismatch");
  }
  if (listing.quantity !== plan.quantity) errors.push(`listing quantity is ${listing.quantity}`);

  const materialProperty = properties.find((property) => property.values?.includes(plan.attributes.material));
  const scaleProperty = properties.find((property) => property.values?.includes(plan.attributes.scale));
  if (!materialProperty || JSON.stringify(materialProperty.values) !== JSON.stringify([plan.attributes.material])) {
    errors.push("material attribute mismatch");
  }
  if (!scaleProperty || JSON.stringify(scaleProperty.values) !== JSON.stringify([plan.attributes.scale])) {
    errors.push("scale attribute mismatch");
  }

  const variationValues = inventory.products
    .flatMap((product) => product.property_values)
    .filter((property) => property.property_name === plan.variation_images.property_name)
    .map((property) => ({
      property_id: property.property_id,
      value_id: property.value_ids?.[0],
      value: property.values?.[0],
    }))
    .filter((value, index, all) => value.value_id && all.findIndex((candidate) => candidate.value_id === value.value_id) === index);
  const altTextForPath = (path) => plan.images.find((image) => image.path === path)?.alt_text;
  const imageIdForAltText = (altText) => actualImages.find((image) => image.alt_text === altText)?.listing_image_id;
  const baseImageId = imageIdForAltText(altTextForPath(plan.variation_images.base_coated_image));
  const unpaintedImageId = imageIdForAltText(altTextForPath(plan.variation_images.unpainted_image));
  const expectedVariationImages = variationValues.map((property) => ({
    property_id: property.property_id,
    value_id: property.value_id,
    image_id: property.value?.includes("Base coated") ? baseImageId : unpaintedImageId,
  }));
  const canonicalVariationImages = (items) => items
    .map((item) => ({ property_id: item.property_id, value_id: item.value_id, image_id: item.image_id }))
    .sort((a, b) => a.value_id - b.value_id);
  if (variationValues.length !== 10) errors.push(`variation value count is ${variationValues.length}`);
  if (
    JSON.stringify(canonicalVariationImages(variationImages)) !==
    JSON.stringify(canonicalVariationImages(expectedVariationImages))
  ) errors.push("variation image mismatch");

  for (const field of [
    "taxonomy_id",
    "shipping_profile_id",
    "return_policy_id",
    "readiness_state_id",
    "shop_section_id",
    "who_made",
    "when_made",
    "is_supply",
    "should_auto_renew",
  ]) {
    if (listing[field] !== templateListing[field]) errors.push(`${field} mismatch`);
  }

  const summary = {
    listing_id: Number(listingId),
    title: listing.title,
    state: listing.state,
    result: errors.length ? "FAIL" : "PASS",
    images: actualImages.length,
    tags: listing.tags?.length || 0,
    products: inventory.products.length,
    enabled_offerings: inventory.products
      .flatMap((product) => product.offerings || [])
      .filter((offering) => offering.is_enabled).length,
    quantity_per_offering: plan.quantity,
    variation_image_mappings: variationImages.length,
    errors,
    note: "Etsy's 'How does your shop produce this item?' field is not exposed by Open API v3 and is not checked.",
  };
  console.log(JSON.stringify(summary, null, 2));
  if (errors.length) throw new Error(`Listing sanity check failed with ${errors.length} issue(s).`);
}

async function commandRenameValues(config, args) {
  const apply = args.includes("--apply");
  const values = args.filter((value) => value !== "--apply");
  const [listingId, propertyName, ...pairs] = values;
  if (!/^\d+$/.test(listingId || "") || !propertyName || pairs.length === 0) {
    throw new Error(
      'Usage: rename-values <listing-id> "<property name>" "old=new" [...] [--apply]',
    );
  }
  const replacements = new Map();
  for (const pair of pairs) {
    const separator = pair.indexOf("=");
    if (separator <= 0 || separator === pair.length - 1) {
      throw new Error(`Invalid replacement (expected old=new): ${pair}`);
    }
    const source = pair.slice(0, separator);
    const target = pair.slice(separator + 1);
    if (replacements.has(source)) throw new Error(`Duplicate source value: ${source}`);
    replacements.set(source, target);
  }
  if (new Set(replacements.values()).size !== replacements.size) {
    throw new Error("Replacement values must be unique.");
  }

  const inventory = await api(config, `/listings/${listingId}/inventory`);
  const { payload, replacementCounts } = inventoryPayload(inventory, propertyName, replacements);
  const currencyCode = inventory.products
    .flatMap((product) => product.offerings || [])
    .find((offering) => offering.price?.currency_code)?.price.currency_code;
  if (!currencyCode) throw new Error("Could not determine the listing currency.");
  const expected = expectedInventoryFromPayload(payload, currencyCode);
  const beforeSummary = summarizeInventory(inventory);
  const afterSummary = summarizeInventory(payload);
  if (JSON.stringify(beforeSummary) !== JSON.stringify(afterSummary)) {
    throw new Error("Dry-run invariant check failed: inventory counts or prices changed.");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const mode = apply ? "apply" : "dry-run";
  const planFile = join(PRIVATE_DIR, "dry-runs", `${listingId}-${timestamp}-${mode}.json`);
  await writeJsonAtomic(planFile, {
    schema_version: 1,
    created_at: new Date().toISOString(),
    mode,
    listing_id: Number(listingId),
    property_name: propertyName,
    replacements: Object.fromEntries(replacements),
    replacement_counts: Object.fromEntries(replacementCounts),
    invariants: beforeSummary,
    payload_sha256: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
    payload,
  });

  console.log(`${apply ? "Validated update" : "Dry run"} for listing ${listingId}:`);
  for (const [source, target] of replacements) {
    console.log(`  ${source} -> ${target} (${replacementCounts.get(source)} products)`);
  }
  console.log(
    `Preserved: ${beforeSummary.products} products, ${beforeSummary.enabled_offerings} enabled offerings, ` +
      `${beforeSummary.unique_prices} unique prices, all quantities, SKUs, processing profiles, and property dimensions.`,
  );
  console.log(`Plan saved: ${planFile}`);

  if (!apply) {
    console.log("No Etsy data was changed. Add --apply to execute this exact transformation.");
    return;
  }

  const beforeFile = join(BACKUP_DIR, `${listingId}-${timestamp}-before-update.json`);
  await writeJsonAtomic(beforeFile, {
    schema_version: 1,
    fetched_at: new Date().toISOString(),
    listing_id: Number(listingId),
    inventory,
  });

  await api(config, `/listings/${listingId}/inventory`, {
    method: "PUT",
    body: payload,
  });
  const verified = await api(config, `/listings/${listingId}/inventory`);
  const actual = canonicalInventory(verified);
  const afterFile = join(BACKUP_DIR, `${listingId}-${timestamp}-after-update.json`);
  await writeJsonAtomic(afterFile, {
    schema_version: 1,
    fetched_at: new Date().toISOString(),
    listing_id: Number(listingId),
    inventory: verified,
  });
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Etsy accepted the update but read-back verification did not match. Inspect ${beforeFile} and ${afterFile}.`,
    );
  }
  console.log("Etsy update succeeded and the complete inventory matched on read-back.");
  console.log(`Before backup: ${beforeFile}`);
  console.log(`After backup: ${afterFile}`);
}

function printHelp() {
  console.log(`Quali3DPrints Etsy API toolkit\n
Usage:
  node scripts/etsy/etsy-api.mjs ping
  node scripts/etsy/etsy-api.mjs auth
  node scripts/etsy/etsy-api.mjs check
  node scripts/etsy/etsy-api.mjs listings [active|inactive|sold_out|draft|expired]
  node scripts/etsy/etsy-api.mjs backup <listing-id>
  node scripts/etsy/etsy-api.mjs audit-listing <listing-id>
  node scripts/etsy/etsy-api.mjs check-listing <listing-id> <plan.json>
  node scripts/etsy/etsy-api.mjs rename-values <listing-id> "<property>" "old=new" [...] [--apply]
  node scripts/etsy/etsy-api.mjs create-draft <plan.json> [--apply]
  node scripts/etsy/etsy-api.mjs create-complete-draft <plan.json> [--apply]
  node scripts/etsy/etsy-api.mjs update-draft <listing-id> <plan.json> [--apply]

Write commands are dry runs unless --apply is explicitly supplied. Draft creation never publishes.`);
}

async function main() {
  const [command = "help", ...args] = process.argv.slice(2);
  if (["help", "--help", "-h"].includes(command)) {
    printHelp();
    return;
  }
  const config = await loadConfig();
  if (command === "ping") return commandPing(config);
  if (command === "auth") return commandAuth(config);
  if (command === "check") return commandCheck(config);
  if (command === "listings") return commandListings(config, args[0]);
  if (command === "backup") return commandBackup(config, args[0]);
  if (command === "audit-listing") return commandAuditListing(config, args[0]);
  if (command === "check-listing") return commandCheckListing(config, args);
  if (command === "rename-values") return commandRenameValues(config, args);
  if (command === "create-draft") return commandCreateDraft(config, args);
  if (command === "create-complete-draft") return commandCreateCompleteDraft(config, args);
  if (command === "update-draft") return commandUpdateDraft(config, args);
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => fail(error.message));
