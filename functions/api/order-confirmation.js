const MAX_REQUEST_BYTES = 18000;
const REQUEST_ID_PATTERN = /^MTF-\d{8}-[A-Z0-9]{5}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });
}

function normalizeField(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isSameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function buildConfirmationEmail({ name, requestId, estimatedSubtotal, message }) {
  const greetingName = name.split(/\s+/)[0] || name;
  const subject = `We received your MiniTankForge request ${requestId}`;
  const text = [
    `Hi ${greetingName},`,
    '',
    'Thank you. Your MiniTankForge order request has been received.',
    '',
    `Request ID: ${requestId}`,
    `Estimated product subtotal: ${estimatedSubtotal}`,
    '',
    'What happens next',
    'I will review availability, production time, shipping, and the final total, then reply by email. No payment has been taken and this is not yet a confirmed order.',
    '',
    'Your request',
    message,
    '',
    'You can reply to this email if you need to add or correct anything.',
    '',
    'MiniTankForge',
  ].join('\n');

  const safeGreetingName = escapeHtml(greetingName);
  const safeRequestId = escapeHtml(requestId);
  const safeSubtotal = escapeHtml(estimatedSubtotal);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br>');
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f1eee6;color:#171b1f;font-family:Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;padding:28px 16px;">
      <div style="background:#ffffff;border:1px solid #d8d3c7;border-radius:12px;overflow:hidden;">
        <div style="background:#263127;color:#ffffff;padding:20px 24px;">
          <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#d6c99a;">MiniTankForge</div>
          <h1 style="font-size:24px;line-height:1.25;margin:8px 0 0;">Request received</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;">Hi ${safeGreetingName},</p>
          <p style="margin:0 0 18px;line-height:1.55;">Thank you. Your MiniTankForge order request has been received.</p>
          <div style="background:#f7f5ef;border-left:4px solid #7b6b3f;padding:14px 16px;margin:0 0 20px;">
            <div><strong>Request ID:</strong> ${safeRequestId}</div>
            <div style="margin-top:6px;"><strong>Estimated product subtotal:</strong> ${safeSubtotal}</div>
          </div>
          <h2 style="font-size:18px;margin:22px 0 8px;">What happens next</h2>
          <p style="margin:0 0 20px;line-height:1.55;">I will review availability, production time, shipping, and the final total, then reply by email. No payment has been taken and this is not yet a confirmed order.</p>
          <h2 style="font-size:18px;margin:22px 0 8px;">Your request</h2>
          <div style="background:#f7f5ef;border:1px solid #e1ddd2;border-radius:8px;padding:16px;font-family:Consolas,monospace;font-size:13px;line-height:1.5;word-break:break-word;">${safeMessage}</div>
          <p style="margin:20px 0 0;line-height:1.55;">You can reply to this email if you need to add or correct anything.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

export async function handleOrderConfirmation(context) {
  const { request, env } = context;
  const contentType = request.headers.get('Content-Type') || '';
  const contentLength = Number(request.headers.get('Content-Length') || 0);

  if (!isSameOrigin(request)) {
    return json({ error: 'This request must be sent from the MiniTankForge site.' }, { status: 403 });
  }

  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ error: 'The request must use JSON.' }, { status: 415 });
  }

  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ error: 'The request is too large.' }, { status: 413 });
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  if (rawBody.length > MAX_REQUEST_BYTES || new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return json({ error: 'The request is too large.' }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const website = normalizeField(body.website, 120);
  if (website) {
    return json({ ok: true, confirmationSent: true });
  }

  const name = normalizeField(body.name, 120);
  const email = normalizeField(body.email, 254).toLowerCase();
  const country = normalizeField(body.country, 120);
  const requestId = normalizeField(body.requestId, 32).toUpperCase();
  const estimatedSubtotal = normalizeField(body.estimatedSubtotal, 40);
  const message = normalizeField(body.message, 12000);

  if (!name || !EMAIL_PATTERN.test(email) || !country || !REQUEST_ID_PATTERN.test(requestId) || !estimatedSubtotal || !message.includes(requestId)) {
    return json({ error: 'The confirmation details are incomplete or invalid.' }, { status: 400 });
  }

  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL || 'orders@mail.minitankforge.com';
  const fromName = env.RESEND_FROM_NAME || 'MiniTankForge';
  const replyTo = env.RESEND_REPLY_TO_EMAIL || 'quali3dprint@gmail.com';

  if (!apiKey) {
    return json(
      { error: 'The request was received, but automatic confirmation email is not configured yet.' },
      { status: 503 },
    );
  }

  const confirmation = buildConfirmationEmail({ name, requestId, estimatedSubtotal, message });
  let emailResponse;

  try {
    emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `mtf-confirmation-${requestId}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        reply_to: replyTo,
        subject: confirmation.subject,
        text: confirmation.text,
        html: confirmation.html,
        tags: [{ name: 'type', value: 'order_confirmation' }],
      }),
    });
  } catch {
    return json(
      { error: 'The request was received, but the confirmation email service could not be reached.' },
      { status: 502 },
    );
  }

  if (!emailResponse.ok) {
    return json(
      { error: 'The request was received, but the confirmation email could not be sent.' },
      { status: 502 },
    );
  }

  return json({ ok: true, confirmationSent: true });
}

export const onRequestPost = handleOrderConfirmation;
