import { getStore } from '@netlify/blobs';

const MAP_KEY = 'photos-map';

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
  const photoStore = getStore('drippy-photos');

  if (req.method === 'GET') {
    const data = (await store.get(MAP_KEY, { type: 'json' })) || {};
    return Response.json(data);
  }

  if (req.method === 'POST') {
    if (!isAuthorized(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { productId, dataUrl } = await req.json();
    if (!productId || !dataUrl) return Response.json({ error: 'Missing productId or dataUrl' }, { status: 400 });
    const base64 = dataUrl.split(',')[1];
    const buf = Buffer.from(base64, 'base64');
    const contentType = dataUrl.split(';')[0].split(':')[1] || 'image/png';
    const key = 'photo-' + productId;
    await photoStore.set(key, buf, { metadata: { contentType } });
    const url = '/api/photo/' + encodeURIComponent(productId);
    const map = (await store.get(MAP_KEY, { type: 'json' })) || {};
    map[productId] = url;
    await store.setJSON(MAP_KEY, map);
    return Response.json({ url, photosMap: map });
  }

  if (req.method === 'DELETE') {
    if (!isAuthorized(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { productId } = await req.json();
    if (!productId) return Response.json({ error: 'Missing productId' }, { status: 400 });
    await photoStore.delete('photo-' + productId);
    const map = (await store.get(MAP_KEY, { type: 'json' })) || {};
    delete map[productId];
    await store.setJSON(MAP_KEY, map);
    return Response.json({ photosMap: map });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/photos' };
