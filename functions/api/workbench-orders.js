const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const respond = (data, status = 200) => Response.json(data, { status, headers });

async function authorized(request, secret) {
  if (!/^[a-f0-9]{64}$/.test(secret ?? '')) return false;
  const supplied = request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!supplied) return false;
  const encoder = new TextEncoder();
  const [expected, actual] = await Promise.all([secret, supplied].map(value =>
    crypto.subtle.digest('SHA-256', encoder.encode(value)).then(buffer => new Uint8Array(buffer))));
  let difference = 0;
  for (let index = 0; index < expected.length; index++) difference |= expected[index] ^ actual[index];
  return difference === 0;
}

export async function workbenchOrders(request, env) {
  if (!await authorized(request, env.WORKBENCH_IMPORT_TOKEN)) return respond({ error: 'Unauthorized.' }, 401);
  if (request.method !== 'GET') return respond({ error: 'Method not allowed.' }, 405);
  const after = new URL(request.url).searchParams.get('after') ?? '0';
  if (!/^\d{1,15}$/.test(after)) return respond({ error: 'Invalid order cursor.' }, 400);
  try {
    const { results } = await env.REQUESTS_DB.prepare(`
      SELECT rowid AS sequence, request_id AS reference, created_at AS created,
        email, details, payload_json AS payload
      FROM requests WHERE kind = 'order' AND rowid > ?1 ORDER BY rowid LIMIT 51
    `).bind(Number(after)).all();
    const orders = results.slice(0, 50).map(row => ({ ...row, payload: row.payload ? JSON.parse(row.payload) : null }));
    return respond({ orders, cursor: orders.at(-1)?.sequence ?? Number(after), hasMore: results.length > 50 });
  } catch {
    console.error('Workbench order feed could not be read.');
    return respond({ error: 'Site orders are temporarily unavailable.' }, 503);
  }
}
