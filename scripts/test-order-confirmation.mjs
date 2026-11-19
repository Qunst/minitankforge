import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import catalog from '../functions/.generated/request-catalog.mjs';
import worker from '../worker.js';

const db = new DatabaseSync(':memory:');
db.exec(readFileSync(new URL('../functions/migrations/requests/0001_create_requests.sql', import.meta.url), 'utf8'));
db.exec(readFileSync(new URL('../functions/migrations/requests/0002_workbench_payload.sql', import.meta.url), 'utf8'));
const env = {
  REQUESTS_DB: {
    prepare(sql) {
      return { bind(...args) {
        const statement = db.prepare(sql);
        const params = Object.fromEntries(args.map((value, index) => [String(index + 1), value]));
        return {
          run: async () => ({ meta: statement.run(params) }),
          first: async () => statement.get(params),
          all: async () => ({ results: statement.all(params) }),
        };
      } };
    },
    async batch(statements) {
      db.exec('BEGIN');
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        db.exec('COMMIT');
        return results;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  },
  REQUESTS_LIMIT: { limit: async () => ({ success: true }) },
  RESEND_API_KEY: 'local-mock',
  RESEND_FROM_EMAIL: 'orders@mail.minitankforge.com',
  RESEND_FROM_NAME: 'MiniTankForge',
  RESEND_REPLY_TO_EMAIL: 'owner@example.com',
};

const origin = 'https://minitankforge.com';
const orderId = 'MTF-20261119-123456789ABC';
const inquiryId = 'MTF-Q-20261119-ABCDEF123456';
const [tankKey, tank] = Object.entries(catalog).find(([key]) => key.startsWith('tank|tiger-i|'));
const [setKey, set] = Object.entries(catalog).find(([key]) => key.startsWith('set|german-basic|'));
const calls = [];
let rejectCustomer = true;
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  assert.equal(url, 'https://api.resend.com/emails');
  const message = JSON.parse(init.body);
  const key = init.headers['Idempotency-Key'];
  assert.ok(db.prepare('SELECT request_id FROM requests WHERE request_id = ?').get(
    key.includes(inquiryId) ? inquiryId : orderId,
  ), 'Store every request before sending');
  calls.push({ message, key });
  if (rejectCustomer && key.endsWith('-customer')) return Response.json({}, { status: 429 });
  return Response.json({ id: 'test-message' });
};

async function submit(path, data, options = {}) {
  const tasks = [];
  const response = await worker.fetch(new Request(origin + path, {
    method: 'POST',
    headers: { Origin: options.origin || origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }), env, { waitUntil: task => tasks.push(task) });
  await Promise.all(tasks);
  return response;
}

const inquiry = { requestId: inquiryId, requestTopic: 'Custom finish', email: 'visitor@example.com', details: 'Can you paint it olive?' };
const order = {
  requestId: orderId, name: 'Test Buyer', email: 'buyer@example.com',
  addressLine1: '12 Test Street', city: 'Zagreb', postalCode: '10000', country: 'Croatia',
  notes: 'TEST OWNER NOTE',
  items: [{ key: tankKey, quantity: 2, unitPrice: 0 }, { key: setKey, quantity: 1 }],
};

try {
  assert.equal((await submit('/api/requests', inquiry, { origin: 'https://example.net' })).status, 403);
  assert.equal((await submit('/api/requests', { ...inquiry, website: 'filled' })).status, 400);
  assert.equal((await submit('/api/requests', { ...inquiry, email: 'first@example.com,second@example.com' })).status, 400);
  assert.equal((await submit('/api/order-requests', { ...order, addressLine1: '' })).status, 400);
  assert.equal((await submit('/api/order-requests', { ...order, items: [{ key: 'unknown', quantity: 1 }] })).status, 400);
  assert.equal(calls.length, 0);

  const inquiryResponse = await submit('/api/requests', inquiry);
  assert.equal(inquiryResponse.status, 201);
  assert.deepEqual(await inquiryResponse.json(), { requestId: inquiryId, saved: true });
  assert.equal(calls[0].message.reply_to, inquiry.email);
  assert.deepEqual(calls[0].message.to, ['owner@example.com']);
  assert.match(calls[0].message.text, /Can you paint it olive/);

  const orderResponse = await submit('/api/order-requests', order);
  assert.equal(orderResponse.status, 201);
  assert.deepEqual(await orderResponse.json(), { requestId: orderId, saved: true });
  const owner = calls.find(({ key }) => key === `mtf-requests-${orderId}-owner`).message;
  const customer = calls.find(({ key }) => key === `mtf-requests-${orderId}-customer`).message;
  const expectedSubtotal = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(tank.unitPrice * 2 + set.unitPrice);
  assert.equal(owner.reply_to, order.email);
  assert.ok(owner.text.includes(`Estimated product subtotal: ${expectedSubtotal}`));
  assert.match(owner.text, /TEST OWNER NOTE/);
  assert.deepEqual(customer.to, [order.email]);
  assert.equal(customer.reply_to, 'owner@example.com');
  assert.match(customer.text, /12 Test Street/);
  assert.match(customer.text, /No payment has been taken/);
  assert.ok(customer.text.includes(tank.fullName));
  assert.ok(customer.text.includes(set.fullName));
  assert.doesNotMatch(customer.text, /TEST OWNER NOTE/);
  assert.equal(db.prepare('SELECT details FROM requests WHERE request_id = ?').get(orderId).details, owner.text);
  assert.equal(JSON.parse(db.prepare('SELECT payload_json FROM requests WHERE request_id = ?').get(orderId).payload_json).items[0].quantity, 2);
  const feedUrl = origin + '/api/workbench/orders';
  assert.equal((await worker.fetch(new Request(feedUrl), env, {})).status, 401);
  env.WORKBENCH_IMPORT_TOKEN = 'a'.repeat(64);
  assert.equal((await worker.fetch(new Request(feedUrl, {
    headers: { Authorization: 'Bearer ' + 'b'.repeat(64) },
  }), env, {})).status, 401);
  const feedRequest = suffix => new Request(feedUrl + suffix, {
    headers: { Authorization: 'Bearer ' + env.WORKBENCH_IMPORT_TOKEN },
  });
  const imported = await (await worker.fetch(feedRequest(''), env, {})).json();
  assert.equal(imported.orders.length, 1, 'The protected feed excludes general inquiries');
  assert.equal(imported.orders[0].reference, orderId);
  assert.equal(imported.orders[0].payload.items[0].unitPrice, tank.unitPrice);
  const after = await (await worker.fetch(feedRequest('?after=' + imported.cursor), env, {})).json();
  assert.equal(after.orders.length, 0);
  assert.equal(after.cursor, imported.cursor);
  assert.equal((await worker.fetch(feedRequest('?after=invalid'), env, {})).status, 400);

  assert.equal((await submit('/api/order-requests', order)).status, 200);
  assert.equal(calls.length, 3, 'A repeated submission preserves the original record and jobs');
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM requests').get().count, 2);
  assert.equal(db.prepare("SELECT accepted_at FROM request_notifications WHERE audience = 'customer'").get().accepted_at, null);
  db.exec("UPDATE request_notifications SET next_attempt_at = 0 WHERE audience = 'customer'");
  rejectCustomer = false;
  const tasks = [];
  worker.scheduled(null, env, { waitUntil: task => tasks.push(task) });
  await Promise.all(tasks);
  assert.equal(calls.length, 4, 'Only the failed notification is retried');
  assert.equal(calls[2].key, calls[3].key);
  assert.ok(db.prepare("SELECT accepted_at FROM request_notifications WHERE audience = 'customer'").get().accepted_at);

  env.REQUESTS_LIMIT.limit = async () => ({ success: false });
  assert.equal((await submit('/api/requests', inquiry)).status, 429);
  assert.equal((await worker.fetch(new Request(origin + '/api/direct-inquiry'), env, {})).status, 404);
  console.log('Direct requests and order confirmation tests passed.');
} finally {
  globalThis.fetch = nativeFetch;
}
