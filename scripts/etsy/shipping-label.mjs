#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";

const ROOT = resolve(import.meta.dirname, "../..");
const ENV_FILE = join(ROOT, ".env.etsy.local");
const PRIVATE_DIR = join(ROOT, ".etsy-private");
const TOKEN_FILE = join(PRIVATE_DIR, "oauth-token.json");
const SHOP_FILE = join(PRIVATE_DIR, "shop.json");
const TEST_ORDER_FILE = join(PRIVATE_DIR, "shipping-label-test-order.json");
const RENDERER = join(import.meta.dirname, "render-shipping-label.py");
const API_BASE = "https://api.etsy.com/v3/application";
const TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const euShippingOrigins = new Set(
  "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE".split(" ")
    .flatMap(code => [code.toLowerCase(), regionNames.of(code).toLowerCase()]),
);
euShippingOrigins.add("hrvatska");

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

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, path);
}

async function loadConfig(requireAuth = true) {
  const envSource = existsSync(ENV_FILE) ? await readFile(ENV_FILE, "utf8") : "";
  const fileValues = parseEnv(envSource);
  const bareValues = envSource
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.includes("="));
  if (!fileValues.ETSY_API_KEYSTRING && !fileValues.ETSY_SHARED_SECRET && bareValues.length === 2) {
    [fileValues.ETSY_API_KEYSTRING, fileValues.ETSY_SHARED_SECRET] = bareValues;
  }
  const value = (name, fallback = undefined) => process.env[name] || fileValues[name] || fallback;
  const senderCountry = value("SHIPPING_SENDER_COUNTRY", "Croatia");
  const config = {
    keystring: value("ETSY_API_KEYSTRING"),
    sharedSecret: value("ETSY_SHARED_SECRET"),
    ukVatNumber: value("ETSY_UK_VAT_NUMBER", "370 6004 28"),
    senderCountry,
    sender: {
      name: value("SHIPPING_SENDER_NAME", "Davorin Kunst"),
      address_lines: [
        value("SHIPPING_SENDER_LINE1", "Katanciceva 32"),
        value("SHIPPING_SENDER_CITY", "10430 Samobor"),
        senderCountry,
      ].filter(Boolean),
    },
  };
  if (requireAuth && (!config.keystring || !config.sharedSecret)) {
    throw new Error(`ETSY_API_KEYSTRING and ETSY_SHARED_SECRET are required in ${ENV_FILE}`);
  }
  return config;
}

function apiKey(config) {
  return `${config.keystring}:${config.sharedSecret}`;
}

async function readResponse(response) {
  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Preserve a non-JSON response for diagnostics.
  }
  if (!response.ok) {
    const detail = typeof body === "string" ? body : JSON.stringify(body, null, 2);
    throw new Error(`Etsy returned HTTP ${response.status} ${response.statusText}\n${detail}`);
  }
  return body;
}

async function refreshToken(config, current) {
  if (!current.refresh_token) throw new Error("Saved Etsy token has no refresh token. Run the Etsy auth command again.");
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.keystring,
      refresh_token: current.refresh_token,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const token = await readResponse(response);
  token.obtained_at = Math.floor(Date.now() / 1000);
  await writeJsonAtomic(TOKEN_FILE, token);
  return token;
}

async function accessToken(config) {
  if (!existsSync(TOKEN_FILE)) {
    throw new Error("No OAuth token found. Run: node scripts/etsy/etsy-api.mjs auth");
  }
  let token = await readJson(TOKEN_FILE);
  const expiresAt = Number(token.obtained_at || 0) + Number(token.expires_in || 0);
  if (!token.access_token || Date.now() / 1000 >= expiresAt - 120) {
    token = await refreshToken(config, token);
  }
  return token.access_token;
}

async function api(config, path, query = {}) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${await accessToken(config)}`,
      "x-api-key": apiKey(config),
    },
    signal: AbortSignal.timeout(30_000),
  });
  return readResponse(response);
}

async function getShopId(config) {
  if (existsSync(SHOP_FILE)) {
    const saved = await readJson(SHOP_FILE);
    if (saved.shop_id) return saved.shop_id;
  }
  const me = await api(config, "/users/me");
  const shop = await api(config, `/users/${me.user_id}/shops`);
  await writeJsonAtomic(SHOP_FILE, {
    fetched_at: new Date().toISOString(),
    user_id: me.user_id,
    shop_id: shop.shop_id,
    shop_name: shop.shop_name,
  });
  return shop.shop_id;
}

function countryName(countryIso) {
  const code = String(countryIso || "").trim().toUpperCase();
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

function moneyValue(money) {
  if (!money || !Number.isFinite(Number(money.amount)) || !Number.isFinite(Number(money.divisor))) {
    return null;
  }
  const divisor = Number(money.divisor);
  if (!divisor) return null;
  return {
    currency: String(money.currency_code || "").toUpperCase(),
    value: (Number(money.amount) / divisor).toFixed(2),
  };
}

function compactText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function capitalizeRecipientName(value) {
  return compactText(value).replace(/\p{L}[\p{L}\p{M}]*/gu, (word) => {
    const lower = word.toLocaleLowerCase();
    const upper = word.toLocaleUpperCase();
    if (word !== lower && word !== upper) return word;
    return `${Array.from(lower)[0].toLocaleUpperCase()}${Array.from(lower).slice(1).join("")}`;
  });
}

function isPhoneLine(value) {
  const line = compactText(value);
  const digits = line.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 18) return false;
  const withoutLabel = line
    .replace(/^\s*(?:phone|telephone|tel|mobile|mob)\s*[:.-]?\s*/i, "")
    .replace(/\s*(?:ext(?:ension)?|x)\s*\d+\s*$/i, "");
  return /^[+()\d][+()\d\s./-]*$/.test(withoutLabel);
}

function receiptPhone(receipt) {
  const direct = [
    receipt.phone,
    receipt.phone_number,
    receipt.shipping_phone,
    receipt.shipping_phone_number,
    receipt.buyer_phone,
  ]
    .map(compactText)
    .find(Boolean);
  if (direct) return direct;
  const addressCandidates = [
    receipt.first_line,
    receipt.second_line,
    ...String(receipt.formatted_address || "").split(/\r?\n|<br\s*\/?\s*>/i),
  ].map(compactText);
  return addressCandidates.find(isPhoneLine) || "";
}

function simpleItemTitle(value) {
  const parts = compactText(value)
    .replace(/\s+[–—]\s+/g, " - ")
    .split(/\s+[-:|]\s+/)
    .map((part) => part.replace(/^1:\d+\s+/i, "").trim())
    .filter(
      (part) =>
        part &&
        !/^(?:detailed\s+mini|3d-printed\s+wwii|wwii\s+micro\s+tanks?|board\s+game\s+upgrade)/i.test(part),
    );
  return parts
    .join(" ")
    .replace(/\bpack\s+(?=full\s+pack\b)/i, "")
    .trim();
}

function selectedVariations(transaction) {
  return (transaction.variations || [])
    .map((variation) =>
      compactText(
        variation.formatted_value ||
          variation.value ||
          (Array.isArray(variation.values) ? variation.values.join(" ") : ""),
      ),
    )
    .filter(Boolean);
}

function transactionLine(transaction) {
  let title = simpleItemTitle(transaction.title) || "Order item";
  const values = selectedVariations(transaction)
    .filter((value) => !title.toLowerCase().includes(value.toLowerCase()));
  if (values.some((value) => /^full\s+pack\b/i.test(value))) {
    title = title.replace(/\s+pack$/i, "");
  }
  const quantity = Number(transaction.quantity || 1);
  return `${quantity > 1 ? `${quantity}x ` : ""}${title}${values.length ? ` ${values.join(" ")}` : ""}`;
}

// Counts for named variants verified against the seller's Etsy listings.
const namedModelCounts = {
  1211923028: { "complete set": 6, "tiger i": 1, "tiger ii": 1, panther: 1, ferdinand: 1, jagdpanther: 1, "stug iii": 1 },
  1873863126: { sherman: 1, "sherman firefly": 1, pershing: 1, "m3 lee": 1, "m18 hellcat": 1, "m5a1 stuart": 1 },
  4374813460: { "full pack": 24, "basic pack": 18, hellcat: 1, "extra hellcat": 1 },
};

// This listing is the six-piece German Tanks Set in the MiniTankForge catalog.
const fixedPackCounts = { 4500204732: 6 };
const tankTerms = /\b(?:tanks?|tankers?)\b/i;
const relatedModelTerms = /\b(?:armou?red (?:cars?|vehicles?)|trucks?|cannons?|artillery|howitzers?|anti[- ]tank guns?|assault guns?)\b/i;

function modelCountForLine(transaction) {
  const listingId = String(transaction.listing_id);
  const quantity = Number(transaction.quantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1) return null;
  const variants = selectedVariations(transaction).map((variant) => variant.toLowerCase());
  const counts = variants.flatMap((variant) => {
    const match = variant.match(/^(\d+)\s+(?:tanks?|models?|miniatures?|vehicles?|trucks?|cannons?|guns?|figures?|pieces?)$/);
    return match ? [Number(match[1])] : [];
  });
  if (!counts.length) {
    const namedCounts = namedModelCounts[listingId] || {};
    for (const variant of variants) {
      const choice = listingId === "4374813460"
        ? variant.replace(/^(?:unpainted|base[\s-]*coat(?:ed)?)\s+/, "")
        : variant;
      if (Object.hasOwn(namedCounts, choice)) counts.push(namedCounts[choice]);
    }
  }
  if (!counts.length && Object.hasOwn(fixedPackCounts, listingId)) {
    counts.push(fixedPackCounts[listingId]);
  }
  if (new Set(counts).size !== 1) return null;
  const total = counts[0] * quantity;
  return Number.isSafeInteger(total) && total > 0 ? total : null;
}

function tankScale(transaction) {
  const selected = selectedVariations(transaction).join(" ");
  const scales = selected.match(/\b1:\d+\b/g) || compactText(transaction.title).match(/\b1:\d+\b/g) || [];
  const unique = [...new Set(scales)];
  return unique.length === 1 ? unique[0] : null;
}

function tankFinish(transaction) {
  const selected = selectedVariations(transaction).join(" ");
  for (const value of [selected, compactText(transaction.title)]) {
    if (/\b(?:uncoated|unpainted|raw(?: print)?|no finish)\b/i.test(value)) return "uncoated";
    if (/\b(?:base[\s-]*(?:coat(?:ed)?|colou?r)|coated|painted|primed)\b/i.test(value)) return "coated";
  }
  return null;
}

function tankOrderDescription(transactions, modelCount) {
  const scales = [...new Set(transactions.map(tankScale))];
  const scale = scales.filter(Boolean).join(" / ");
  const scaleText = [scale, scales.includes(null) && "scale unspecified"].filter(Boolean).join(" / ");
  const finishes = new Set(transactions.map(tankFinish));
  let finish = "finish unspecified";
  if (finishes.has("coated") && finishes.has("uncoated")) {
    finish = "coated-uncoated mix";
  } else if (!finishes.has(null)) {
    [finish] = finishes;
  }
  return `Tenkici: ${scaleText}, ${modelCount} ${modelCount === 1 ? "tank" : "tanks"}, ${finish}`;
}

function orderDescription(transactions, receiptId, modelOverride) {
  let modelCount;
  if (modelOverride !== undefined) {
    modelCount = Number(modelOverride);
    if (!/^\d+$/.test(String(modelOverride)) || !Number.isSafeInteger(modelCount) || modelCount < 1) {
      throw new Error("Model total must be a positive whole number.");
    }
  }
  const tankOrder = transactions.some((line) => tankTerms.test(line.title)) &&
    transactions.every((line) => tankTerms.test(line.title) || relatedModelTerms.test(line.title));
  const lineCounts = tankOrder || transactions.length > 3 ? transactions.map(modelCountForLine) : [];
  const tankSummary = tankOrder && (
    transactions.length > 1 || (modelCount ?? lineCounts[0]) > 1 ||
    (lineCounts[0] === null && (
      Number(transactions[0].quantity) > 1 ||
      /\b(?:pack|set|bundle)\b/i.test([transactions[0].title, ...selectedVariations(transactions[0])].join(" "))
    ))
  );
  if (!tankSummary && transactions.length <= 3) {
    const description = transactions.map(transactionLine).filter(Boolean).join(" | ");
    return [description, modelCount && `${modelCount} ${modelCount === 1 ? "model" : "models"}`].filter(Boolean).join(" - ");
  }
  if (modelCount === undefined) {
    const unknown = transactions.filter((_, index) => lineCounts[index] === null);
    if (unknown.length) {
      throw new Error(
        `Cannot verify the model total for order #${receiptId}. Check the pack size for: ` +
        `${unknown.map(transactionLine).join("; ")}. Then provide the verified order total with --models.`,
      );
    }
    modelCount = lineCounts.reduce((sum, count) => sum + count, 0);
  }
  if (tankSummary) return tankOrderDescription(transactions, modelCount);

  const variationValues = transactions.flatMap(selectedVariations);
  const scales = new Set(variationValues.map((value) => value.match(/\b1:\d+\b/)?.[0]).filter(Boolean));
  const finishes = new Set(variationValues
    .map((value) => value.match(/\b(unpainted|base\s*coat(?:ed)?|painted)\b/i)?.[1])
    .filter(Boolean)
    .map((value) => value.replace(/\s+/g, " ").replace(/^./, (letter) => letter.toUpperCase())));
  const parts = ["Mixed WW2 tank miniatures"];
  if (scales.size === 1) parts.push(...scales);
  if (finishes.size === 1) parts.push(...finishes);
  parts.push(`${modelCount} ${modelCount === 1 ? "model" : "models"}`);
  return parts.join(" - ");
}

function addressLines(receipt, phone = "") {
  const phoneKey = compactText(phone).toLocaleLowerCase();
  const withoutPhone = (line) => {
    const normalized = compactText(line);
    return normalized && normalized.toLocaleLowerCase() !== phoneKey && !isPhoneLine(normalized);
  };
  const cityLine = [receipt.city, receipt.state, receipt.zip].map(compactText).filter(Boolean).join(" ");
  const explicit = [receipt.first_line, receipt.second_line, cityLine, countryName(receipt.country_iso)]
    .map(compactText)
    .filter(withoutPhone);
  if (explicit.length) return explicit;
  return String(receipt.formatted_address || "")
    .split(/\r?\n|<br\s*\/?\s*>/i)
    .map(compactText)
    .filter(
      (line) =>
        withoutPhone(line) &&
        line.toLocaleLowerCase() !== compactText(receipt.name).toLocaleLowerCase(),
    );
}

function requiresEtsyUkVat(config, receipt) {
  const country = compactText(receipt.country_iso).toUpperCase();
  if (!["GB", "UK", "XI"].includes(country)) return false;
  const postcode = compactText(receipt.zip).replace(/\s+/g, "");
  const northernIreland = country === "XI" || /^BT\d{1,2}\d[A-Z]{2}$/i.test(postcode)
    || /^northern ireland$/i.test(compactText(receipt.state));
  const origin = compactText(config.senderCountry).toLowerCase();
  return !(northernIreland && euShippingOrigins.has(origin));
}

function normalizeOrder(config, receipt, transactions, options = {}) {
  const countryIso = compactText(receipt.country_iso || options.country_iso).toUpperCase();
  const phone = compactText(options.phone || receiptPhone(receipt));
  const description =
    options.description ||
    orderDescription(transactions, receipt.receipt_id, options.models) ||
    `Etsy order ${receipt.receipt_id}`;
  let ukVat = null;
  if (options.includeEtsyUkVat !== false && requiresEtsyUkVat(config, { ...receipt, country_iso: countryIso })) {
    const automatic = [receipt.subtotal, receipt.total_price, receipt.grandtotal]
      .map(moneyValue)
      .find((money) => money?.currency === "GBP");
    const currency = String(options.currency || (options.value ? "GBP" : automatic?.currency) || "").toUpperCase();
    const value = options.value || automatic?.value;
    if (!value) {
      throw new Error(
        "This is a UK order, but the Etsy API did not return the package value in GBP. " +
          "Copy the exact GBP package value from Etsy Shop Manager.",
      );
    }
    if (currency !== "GBP") {
      throw new Error("UK package value must be in GBP. Use --value AMOUNT --currency GBP.");
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      throw new Error(`Invalid UK package value: ${value}`);
    }
    ukVat = { number: config.ukVatNumber, currency: "GBP", value: numericValue.toFixed(2) };
  }
  return {
    schema_version: 1,
    title: receipt.receipt_id ? `Etsy shipping label ${receipt.receipt_id}` : "Shipping label",
    receipt_id: receipt.receipt_id || null,
    source: receipt.receipt_id ? "etsy_api" : "private_test_fixture",
    recipient: {
      name: capitalizeRecipientName(receipt.name),
      address_lines: addressLines(receipt, phone),
      phone: phone || null,
      country_iso: countryIso,
    },
    sender: config.sender,
    description,
    uk_vat: ukVat,
  };
}

function parseOptions(args) {
  const positional = [];
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("--")) {
      positional.push(value);
      continue;
    }
    const name = value.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) options[name] = true;
    else {
      options[name] = next;
      index += 1;
    }
  }
  return { positional, options };
}

async function runRenderer(inputPath, outputPath, python = process.env.ETSY_LABEL_PYTHON, renderer = RENDERER) {
  const candidates = [
    python,
    process.env.PYTHON_BIN,
    "python",
    "python3",
  ].filter((value, index, all) => value && all.indexOf(value) === index);
  let lastError = null;
  for (const executable of candidates) {
    const result = await new Promise((resolveResult) => {
      const child = spawn(executable, [renderer, inputPath, outputPath], { stdio: "inherit", windowsHide: true });
      child.on("error", (error) => resolveResult({ error }));
      child.on("exit", (code) => resolveResult({ code }));
    });
    if (result.code === 0) return;
    lastError = result.error || new Error(`${executable} exited with code ${result.code}`);
  }
  throw new Error(
    `Could not render the PDF with Python/reportlab. Set ETSY_LABEL_PYTHON to a Python executable with reportlab installed. ${lastError?.message || ""}`,
  );
}

async function fetchReceipt(config, receiptId) {
  const shopId = await getShopId(config);
  const receipt = await api(config, `/shops/${shopId}/receipts/${receiptId}`);
  const transactionResponse = await api(config, `/shops/${shopId}/receipts/${receiptId}/transactions`);
  return { receipt, transactions: transactionResponse.results || transactionResponse || [] };
}

async function renderNormalized(normalized, outputPath) {
  const receiptPart = normalized.orders?.length
    ? `batch-${normalized.orders.map((order) => order.receipt_id || "test").join("-")}`
    : normalized.receipt_id || "test";
  const privateJson = join(PRIVATE_DIR, "shipping-labels", `${receiptPart}.json`);
  await writeJsonAtomic(privateJson, normalized);
  await mkdir(dirname(outputPath), { recursive: true });
  await runRenderer(privateJson, outputPath);
  console.log(`Printable PDF: ${outputPath}`);
  console.log(`Private source record: ${privateJson}`);
}

async function commandLabel(config, args) {
  const { positional, options } = parseOptions(args);
  const receiptId = positional[0];
  if (!/^\d+$/.test(receiptId || "")) throw new Error("Usage: label RECEIPT_ID [--output PATH] [--description TEXT] [--models TOTAL] [--phone NUMBER] [--value AMOUNT] [--currency GBP]");
  const { receipt, transactions } = await fetchReceipt(config, receiptId);
  const normalized = normalizeOrder(config, receipt, transactions, options);
  if (!normalized.recipient.name || normalized.recipient.address_lines.length < 2) {
    throw new Error(
      "Etsy did not return a complete shipping address for this receipt. Address access can depend on Etsy approval; do not print an incomplete label.",
    );
  }
  const outputPath = resolve(ROOT, options.output || join("output", "shipping-labels", `etsy-${receiptId}.pdf`));
  await renderNormalized(normalized, outputPath);
}

function receiptValueMap(value, optionName) {
  const result = new Map();
  if (!value) return result;
  for (const assignment of String(value).split(",")) {
    const separator = assignment.indexOf("=");
    const receiptId = assignment.slice(0, separator).trim();
    const amount = assignment.slice(separator + 1).trim();
    if (separator < 1 || !/^\d+$/.test(receiptId) || !amount) {
      throw new Error(`${optionName} must use RECEIPT_ID=VALUE assignments separated by commas.`);
    }
    result.set(receiptId, amount);
  }
  return result;
}

async function commandBatch(config, args) {
  const { positional, options } = parseOptions(args);
  if (positional.length < 2 || positional.some((receiptId) => !/^\d+$/.test(receiptId))) {
    throw new Error("Usage: batch RECEIPT_ID RECEIPT_ID [...] [--models RECEIPT_ID=TOTAL] [--phone RECEIPT_ID=NUMBER] [--gbp RECEIPT_ID=AMOUNT] [--output PATH]");
  }
  const gbpValues = receiptValueMap(options.gbp, "--gbp");
  const phoneValues = receiptValueMap(options.phone, "--phone");
  const modelTotals = receiptValueMap(options.models, "--models");
  for (const receiptId of modelTotals.keys()) {
    if (!positional.includes(receiptId)) throw new Error(`--models refers to order #${receiptId}, which is not in this batch.`);
  }
  const fetched = await Promise.all(
    positional.map(async (receiptId) => ({ receiptId, ...(await fetchReceipt(config, receiptId)) })),
  );
  const orders = fetched.map(({ receiptId, receipt, transactions }) => {
    const value = gbpValues.get(receiptId);
    const phone = phoneValues.get(receiptId);
    const normalized = normalizeOrder(config, receipt, transactions, {
      ...(value ? { value, currency: "GBP" } : {}),
      ...(phone ? { phone } : {}),
      models: modelTotals.get(receiptId),
    });
    if (!normalized.recipient.name || normalized.recipient.address_lines.length < 2) {
      throw new Error(`Etsy did not return a complete shipping address for receipt ${receiptId}.`);
    }
    return normalized;
  });
  const normalized = {
    schema_version: 1,
    title: `Etsy shipping labels ${positional.join(" and ")}`,
    source: "etsy_api_batch",
    orders,
  };
  const outputPath = resolve(
    ROOT,
    options.output || join("output", "shipping-labels", `etsy-${positional.join("-")}.pdf`),
  );
  await renderNormalized(normalized, outputPath);
}

async function commandRecent(config, args) {
  const { options } = parseOptions(args);
  const shopId = await getShopId(config);
  const limit = Math.min(100, Math.max(1, Number(options.limit || 25)));
  const response = await api(config, `/shops/${shopId}/receipts`, {
    limit,
    offset: 0,
    sort_on: "created",
    sort_order: "desc",
    was_paid: true,
    was_shipped: false,
    was_canceled: false,
  });
  const rows = (response.results || []).map((receipt) => ({
    receipt_id: receipt.receipt_id,
    created: new Date(Number(receipt.created_timestamp || receipt.create_timestamp || 0) * 1000).toISOString(),
    name: receipt.name,
    country_iso: receipt.country_iso,
    status: receipt.status,
    total: moneyValue(receipt.grandtotal),
    items: (receipt.transactions || []).map(transactionLine),
  }));
  console.log(JSON.stringify(rows, null, 2));
  console.log("Read-only: Etsy data was not changed.");
}

async function commandTest(config, args) {
  const { options } = parseOptions(args);
  if (!existsSync(TEST_ORDER_FILE)) {
    throw new Error(`Missing private test order: ${TEST_ORDER_FILE}`);
  }
  const fixture = await readJson(TEST_ORDER_FILE);
  const normalized = {
    ...fixture,
    sender: config.sender,
    uk_vat: ["GB", "UK"].includes(String(fixture.recipient?.country_iso || "").toUpperCase())
      ? fixture.uk_vat
      : null,
  };
  const outputPath = resolve(ROOT, options.output || join("output", "shipping-labels", "test-benjamin-peant.pdf"));
  await renderNormalized(normalized, outputPath);
}

function printHelp() {
  console.log(`MiniTankForge Etsy shipping labels

Usage:
  node scripts/etsy/shipping-label.mjs recent [--limit 25]
  node scripts/etsy/shipping-label.mjs label RECEIPT_ID [--output PATH]
  node scripts/etsy/shipping-label.mjs label RECEIPT_ID --description "Simple order text"
  node scripts/etsy/shipping-label.mjs label RECEIPT_ID --models TOTAL
  node scripts/etsy/shipping-label.mjs label RECEIPT_ID --phone "+39 324 681 2614"
  node scripts/etsy/shipping-label.mjs label RECEIPT_ID --value 18.79 --currency GBP
  node scripts/etsy/shipping-label.mjs batch RECEIPT_ID RECEIPT_ID [--models RECEIPT_ID=TOTAL] [--phone RECEIPT_ID=NUMBER] [--gbp RECEIPT_ID=AMOUNT]
  node scripts/etsy/shipping-label.mjs test [--output PATH]

The Etsy commands are read-only. UK VAT and value are printed only for GB/UK addresses.`);
}

async function main() {
  const [command = "help", ...args] = process.argv.slice(2);
  if (["help", "--help", "-h"].includes(command)) return printHelp();
  const config = await loadConfig(command !== "test");
  if (command === "recent") return commandRecent(config, args);
  if (command === "label") return commandLabel(config, args);
  if (command === "batch") return commandBatch(config, args);
  if (command === "test") return commandTest(config, args);
  throw new Error(`Unknown command: ${command}`);
}

export { api, fetchReceipt, getShopId, loadConfig, moneyValue, normalizeOrder,
  orderDescription, receiptPhone, requiresEtsyUkVat, runRenderer, selectedVariations, tankFinish, tankScale };

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
}
