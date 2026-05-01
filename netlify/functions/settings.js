import { getStore } from '@netlify/blobs';

const KEY = 'admin-settings';

const PRIVATE_FIELDS = [
  'subscribers', 'custom_orders', 'purchased_custom',
  'orders', 'sales', 'admin_email'
];
const PUBLIC_APPENDABLE = [
  'subscribers', 'custom_orders', 'purchased_custom', 'orders', 'sales'
];

function isAuthorized(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const provided = auth.slice(7);
  if (provided.length !== expected.length) return false;
  let same = 0;
  for (let i = 0; i < provided.length; i++) {
    same |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return same === 0;
}

export default async (req) => {
  const store = getStore('drippy');

  if (req.method === 'GET') {
    const data = (await store.get(KEY, { type: 'json' })) || {};
    if (req.headers.get('authorization')) {
      if (!isAuthorized(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      return Response.json(data);
    }
    const pub = { ...data };
    PRIVATE_FIELDS.forEach(f => delete pub[f]);
    return Response.json(pub);
  }

  if (req.method === 'PUT') {
    const body = await req.json().catch(() => ({}));
    if (isAuthorized(req)) {
      await store.setJSON(KEY, body || {});
      return Response.json({ ok: true });
    }
    const current = (await store.get(KEY, { type: 'json' })) || {};
    const merged = { ...current };
    for (const f of PUBLIC_APPENDABLE) {
      if (body[f] !== undefined) merged[f] = body[f];
    }
    await store.setJSON(KEY, merged);
    return Response.json({ ok: true });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/settings' };
