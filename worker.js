import { handleOrderConfirmation } from './functions/api/order-confirmation.js';

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/order-confirmation') {
      if (request.method !== 'POST') {
        return json(
          { error: 'Method not allowed.' },
          { status: 405, headers: { Allow: 'POST' } },
        );
      }

      return handleOrderConfirmation({ request, env });
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'API route not found.' }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
