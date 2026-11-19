const MAX_ATTEMPTS = 6;
const RETRY_DELAY = 10 * 60;
const RETRY_WINDOW = 20 * 60 * 60;

export async function deliverRequestNotifications(env, requestId = null) {
  if (!env.RESEND_API_KEY || !env.REQUESTS_DB) return;

  const db = env.REQUESTS_DB;
  const now = Math.floor(Date.now() / 1000);
  const { results } = await db.prepare(`
    SELECT n.request_id, n.audience
    FROM request_notifications n JOIN requests r ON r.request_id = n.request_id
    WHERE n.accepted_at IS NULL AND n.attempts < ?1 AND n.next_attempt_at <= ?2
      AND r.created_at > ?3 AND (?4 IS NULL OR n.request_id = ?4)
    ORDER BY n.next_attempt_at
    LIMIT 12
  `).bind(MAX_ATTEMPTS, now, now - RETRY_WINDOW, requestId).all();

  for (const job of results) {
    const { request_id: id, audience } = job;
    // Claim before sending so the submit handler and cron cannot send the same job simultaneously.
    const claimed = await db.prepare(`
      UPDATE request_notifications
      SET attempts = attempts + 1, next_attempt_at = ?3
      WHERE request_id = ?1 AND audience = ?2 AND accepted_at IS NULL
        AND next_attempt_at <= ?4 AND attempts < ?5
      RETURNING message_json
    `).bind(id, audience, now + RETRY_DELAY, now, MAX_ATTEMPTS).first();
    if (!claimed) continue;

    let providerId;
    let error = 'Unconfirmed response from Resend';
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `mtf-requests-${id}-${audience}`,
        },
        body: claimed.message_json,
        signal: AbortSignal.timeout(6000),
      });
      if (response.ok) providerId = (await response.json()).id;
      else error = `Resend HTTP ${response.status}`;
    } catch {
      error = 'Resend request failed or timed out';
    }

    if (providerId) {
      await db.prepare(`
        UPDATE request_notifications SET accepted_at = unixepoch(), provider_id = ?3, last_error = NULL
        WHERE request_id = ?1 AND audience = ?2
      `).bind(id, audience, providerId).run();
    } else {
      await db.prepare(`
        UPDATE request_notifications SET last_error = ?3 WHERE request_id = ?1 AND audience = ?2
      `).bind(id, audience, error).run();
      console.warn('Request email queued for retry', id, audience, error);
    }
  }
}
