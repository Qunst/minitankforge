import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const handlerPath = new URL('../functions/api/order-confirmation.js', import.meta.url);
const handlerSource = await readFile(handlerPath, 'utf8');
const handlerModuleUrl = `data:text/javascript;base64,${Buffer.from(handlerSource).toString('base64')}`;
const { handleOrderConfirmation } = await import(handlerModuleUrl);

const validPayload = {
  requestId: 'MTF-20261011-A1B2C',
  name: 'Test Customer',
  email: 'customer@example.com',
  addressLine1: '12 Test Street',
  addressLine2: 'Apartment 3',
  city: 'Zagreb',
  region: 'City of Zagreb',
  country: 'Croatia',
  postalCode: '10000',
  estimatedSubtotal: '€25.00',
  message: 'New MiniTankForge order request\nRequest ID: MTF-20261011-A1B2C\n\nSHIPPING ADDRESS\nStreet address: 12 Test Street\nApartment / unit: Apartment 3\nCity / town: Zagreb\nState / province / region: City of Zagreb\nPostal / ZIP code: 10000\nCountry: Croatia\n\n1. Tiger I',
  website: '',
};

function makeRequest(payload = validPayload, origin = 'https://minitankforge.com') {
  return new Request('https://minitankforge.com/api/order-confirmation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
    },
    body: JSON.stringify(payload),
  });
}

const env = {
  RESEND_API_KEY: 're_test_key',
  RESEND_FROM_EMAIL: 'orders@mail.minitankforge.com',
  RESEND_FROM_NAME: 'MiniTankForge',
  RESEND_REPLY_TO_EMAIL: 'quali3dprint@gmail.com',
};

const originalFetch = globalThis.fetch;
const calls = [];

try {
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ id: 'email_test_123' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const successResponse = await handleOrderConfirmation({ request: makeRequest(), env });
  assert.equal(successResponse.status, 200);
  assert.deepEqual(await successResponse.json(), { ok: true, confirmationSent: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].init.headers['Idempotency-Key'], 'mtf-confirmation-MTF-20261011-A1B2C');

  const sentEmail = JSON.parse(calls[0].init.body);
  assert.deepEqual(sentEmail.to, ['customer@example.com']);
  assert.equal(sentEmail.reply_to, 'quali3dprint@gmail.com');
  assert.match(sentEmail.subject, /MTF-20261011-A1B2C/);
  assert.match(sentEmail.text, /No payment has been taken/);
  assert.match(sentEmail.text, /12 Test Street/);

  const crossOriginResponse = await handleOrderConfirmation({
    request: makeRequest(validPayload, 'https://example.org'),
    env,
  });
  assert.equal(crossOriginResponse.status, 403);
  assert.equal(calls.length, 1);

  const invalidResponse = await handleOrderConfirmation({
    request: makeRequest({ ...validPayload, email: 'not-an-email' }),
    env,
  });
  assert.equal(invalidResponse.status, 400);
  assert.equal(calls.length, 1);

  const missingAddressResponse = await handleOrderConfirmation({
    request: makeRequest({ ...validPayload, addressLine1: '' }),
    env,
  });
  assert.equal(missingAddressResponse.status, 400);
  assert.equal(calls.length, 1);

  const missingSecretResponse = await handleOrderConfirmation({
    request: makeRequest(),
    env: {},
  });
  assert.equal(missingSecretResponse.status, 503);
  assert.equal(calls.length, 1);

  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Rejected' }), { status: 422 });
  const rejectedResponse = await handleOrderConfirmation({ request: makeRequest(), env });
  assert.equal(rejectedResponse.status, 502);

  console.log('Order confirmation tests passed.');
} finally {
  globalThis.fetch = originalFetch;
}
