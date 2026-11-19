import catalog from '../.generated/request-catalog.mjs';
import { buildConfirmationEmail } from './order-confirmation.js';
import { deliverRequestNotifications } from './request-notifications.js';

const MAX_BYTES = 48000;
const EMAIL = /^[^\s@<>,;:"()[\]\\]+@[A-Za-z0-9.-]+\.[A-Za-z0-9-]+$/;
const ORDER_ID = /^MTF-\d{8}-[A-F0-9]{12}$/;
const INQUIRY_ID = /^MTF-Q-\d{8}-[A-F0-9]{12}$/;
const euros = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

function reply(body, status) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function field(body, key) {
  return typeof body[key] === 'string' ? body[key].trim() : '';
}

async function readBody(request) {
  if (!request.body || Number(request.headers.get('Content-Length')) > MAX_BYTES) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

function readInquiry(body) {
  const topic = field(body, 'requestTopic');
  const reference = field(body, 'reference');
  const details = field(body, 'details');
  if (!topic || topic.length > 120 || /[\r\n]/.test(topic) || reference.length > 500 || !details || details.length > 4000) {
    return null;
  }
  return { topic, reference, details };
}

function readOrder(body) {
  const limits = {
    name: 120, addressLine1: 180, addressLine2: 180, city: 120, region: 120,
    postalCode: 32, country: 120, deadline: 160, notes: 4000,
  };
  const address = {};
  for (const [key, limit] of Object.entries(limits)) {
    const value = field(body, key);
    if (value.length > limit || (key !== 'notes' && /[\r\n]/.test(value))) return null;
    address[key] = value;
  }
  if (!address.name || !address.addressLine1 || !address.city || !address.postalCode || !address.country) return null;
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 40) return null;

  const seen = new Set();
  const items = [];
  for (const { key, quantity } of body.items.map(item => item || {})) {
    if (typeof key !== 'string' || !Object.hasOwn(catalog, key) || seen.has(key)) return null;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) return null;
    seen.add(key);
    items.push({ ...catalog[key], quantity });
  }
  return { ...address, items };
}

function orderSummary(order) {
  const itemLines = order.items.map(item => [
    `${item.fullName} · ${item.scale} · ${item.finish}`,
    item.optionLabel ? `${item.optionLabel}: ${item.optionValue}` : '',
    `${item.quantity} ${item.type === 'tank' ? 'pack(s)' : 'set(s)'} × ${euros.format(item.unitPrice)} = ${euros.format(item.unitPrice * item.quantity)}`,
    item.itemUrl,
  ].filter(Boolean).join('\n')).join('\n\n');
  const subtotal = euros.format(order.items.reduce((cents, item) => cents + Math.round(item.unitPrice * 100) * item.quantity, 0) / 100);
  const shippingAddress = [
    order.name, order.addressLine1, order.addressLine2,
    [order.postalCode, order.city, order.region].filter(Boolean).join(' '), order.country,
  ].filter(Boolean).join('\n');
  return { subtotal, itemLines, shippingAddress };
}

function composeMessages(kind, id, email, data, env) {
  const from = `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`;
  const owner = env.RESEND_REPLY_TO_EMAIL;
  if (kind === 'inquiry') {
    const subject = `MiniTankForge request — ${data.topic}`;
    const text = [`Request ID: ${id}`, `Reply email: ${email}`, `Topic: ${data.topic}`,
      data.reference ? `Reference: ${data.reference}` : '', '', data.details].filter(Boolean).join('\n');
    return { subject, text, notifications: [['owner', { from, to: [owner], reply_to: email, subject, text }]] };
  }

  const { subtotal, itemLines, shippingAddress } = orderSummary(data);
  const summary = [shippingAddress, '', 'REQUESTED ITEMS', itemLines, '',
    `Estimated product subtotal: ${subtotal}`, 'Shipping will be confirmed by email. No payment has been taken.'].join('\n');
  const subject = `MiniTankForge order request ${id}`;
  const text = [`Request ID: ${id}`, `Reply email: ${email}`, '',
    'SHIPPING ADDRESS', summary, '', `Requested deadline: ${data.deadline || 'Not provided'}`,
    `Customer notes: ${data.notes || 'None'}`].join('\n');
  const confirmation = buildConfirmationEmail({
    name: data.name, requestId: id, estimatedSubtotal: subtotal, message: `SHIPPING ADDRESS\n${summary}`,
  });
  return {
    subject, text,
    notifications: [
      ['owner', { from, to: [owner], reply_to: email, subject, text }],
      ['customer', { from, to: [email], reply_to: owner, ...confirmation }],
    ],
  };
}

export async function handleDirectRequest(request, env, ctx, kind) {
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return reply({ error: 'Open the form on MiniTankForge to send a request.' }, 403);
  }
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return reply({ error: 'The request must use JSON.' }, 415);
  }
  if (!env.REQUESTS_DB || !env.REQUESTS_LIMIT || !env.RESEND_REPLY_TO_EMAIL || !env.RESEND_FROM_EMAIL || !env.RESEND_FROM_NAME) {
    return reply({ error: 'The form is temporarily unavailable. Please use the email option.' }, 503);
  }

  let id;
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'local';
    const perIp = await env.REQUESTS_LIMIT.limit({ key: `${kind}:ip:${ip}` });
    if (!perIp.success) return reply({ error: 'Too many requests. Please try again in a minute.' }, 429);

    const body = await readBody(request);
    if (!body || typeof body !== 'object' || Array.isArray(body) || field(body, 'website')) {
      return reply({ error: 'The request could not be read. Check the form and try again.' }, 400);
    }
    id = field(body, 'requestId');
    const email = field(body, 'email');
    const idPattern = kind === 'order' ? ORDER_ID : INQUIRY_ID;
    if (!idPattern.test(id) || !EMAIL.test(email) || email.length > 254) {
      return reply({ error: 'Enter a valid email address and try again.' }, 400);
    }

    const data = kind === 'order' ? readOrder(body) : readInquiry(body);
    if (!data) {
      const error = kind === 'order'
        ? 'Check your shipping address and basket items. Refresh the page if any item is no longer available.'
        : 'Enter a short topic and your request details.';
      return reply({ error }, 400);
    }
    const perEmail = await env.REQUESTS_LIMIT.limit({ key: `${kind}:email:${email.toLowerCase()}` });
    if (!perEmail.success) return reply({ error: 'Too many requests. Please try again in a minute.' }, 429);

    const { subject, text, notifications } = composeMessages(kind, id, email, data, env);
    const statements = [
      env.REQUESTS_DB.prepare(`
        INSERT INTO requests (request_id, kind, email, subject, details, payload_json) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT (request_id) DO NOTHING
      `).bind(id, kind, email, subject, text, kind === 'order' ? JSON.stringify(data) : null),
      ...notifications.map(([audience, message]) => env.REQUESTS_DB.prepare(`
        INSERT INTO request_notifications (request_id, audience, message_json) VALUES (?1, ?2, ?3)
        ON CONFLICT (request_id, audience) DO NOTHING
      `).bind(id, audience, JSON.stringify(message))),
    ];
    const [saved] = await env.REQUESTS_DB.batch(statements);
    ctx.waitUntil(deliverRequestNotifications(env, id));
    return reply({ requestId: id, saved: true }, saved.meta.changes ? 201 : 200);
  } catch {
    console.error('Could not save MiniTankForge request', id || 'invalid ID');
    return reply({ error: 'Saving could not be confirmed. Please try again with the same details.' }, 503);
  }
}
