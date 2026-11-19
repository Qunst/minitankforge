import { handleDirectRequest } from './functions/api/direct-requests.js';
import { deliverRequestNotifications } from './functions/api/request-notifications.js';
import { workbenchOrders } from './functions/api/workbench-orders.js';

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
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/workbench/orders') return workbenchOrders(request, env);

    const kind = url.pathname === '/api/requests' ? 'inquiry'
      : url.pathname === '/api/order-requests' ? 'order'
      : null;
    if (kind) {
      if (request.method !== 'POST') {
        return json(
          { error: 'Method not allowed.' },
          { status: 405, headers: { Allow: 'POST' } },
        );
      }

      return handleDirectRequest(request, env, ctx, kind);
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'API route not found.' }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },

  scheduled(_event, env, ctx) {
    ctx.waitUntil(deliverRequestNotifications(env));
  },
};
