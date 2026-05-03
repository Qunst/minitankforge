function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeField(value, maxLength = 2000) {
  return String(value || '').trim().slice(0, maxLength);
}

export async function onRequestPost(context) {
  let body;

  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const requestTopic = normalizeField(body.requestTopic || body.tankName, 140);
  const email = normalizeField(body.email, 180);
  const reference = normalizeField(body.reference, 400);
  const details = normalizeField(body.details, 3000);
  const website = normalizeField(body.website, 120);

  if (website) {
    return json({ ok: true });
  }

  if (!requestTopic || !email || !details) {
    return json({ error: 'Request topic, email, and details are required.' }, { status: 400 });
  }

  const accountId = context.env.CF_ACCOUNT_ID;
  const apiToken = context.env.CF_EMAIL_API_TOKEN;
  const fromAddress = context.env.CF_EMAIL_FROM;
  const fromName = context.env.CF_EMAIL_FROM_NAME || 'MiniTankForge';
  const toAddress = context.env.CONTACT_TO_EMAIL || 'quali3dprint@gmail.com';

  if (!accountId || !apiToken || !fromAddress) {
    return json(
      {
        error: 'The request form is not fully configured yet. Please use the email option instead.',
      },
      { status: 503 },
    );
  }

  const safeRequestTopic = escapeHtml(requestTopic);
  const safeEmail = escapeHtml(email);
  const safeReference = escapeHtml(reference || 'Not provided');
  const safeDetails = escapeHtml(details).replaceAll('\n', '<br>');

  const subject = `MiniTankForge request: ${requestTopic}`;
  const text = [
    'New request from MiniTankForge',
    '',
    `Request topic: ${requestTopic}`,
    `Reply email: ${email}`,
    `Reference: ${reference || 'Not provided'}`,
    '',
    'Details:',
    details,
  ].join('\n');

  const html = `
    <h2>New request from MiniTankForge</h2>
    <p><strong>Request topic:</strong> ${safeRequestTopic}</p>
    <p><strong>Reply email:</strong> ${safeEmail}</p>
    <p><strong>Reference:</strong> ${safeReference}</p>
    <p><strong>Details:</strong><br>${safeDetails}</p>
  `;

  const emailResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: toAddress,
      from: {
        address: fromAddress,
        name: fromName,
      },
      reply_to: email,
      subject,
      text,
      html,
    }),
  });

  const emailResult = await emailResponse.json().catch(() => ({}));

  if (!emailResponse.ok || emailResult.success === false) {
    return json(
      {
        error: 'The request could not be emailed right now. Please use the email option instead.',
      },
      { status: 502 },
    );
  }

  return json({ ok: true });
}
