function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildConfirmationEmail({ name, requestId, estimatedSubtotal, message }) {
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
