import { getStore } from '@netlify/blobs';

export default async (req) => {
  const url = new URL(req.url);
  const id = decodeURIComponent(url.pathname.split('/').pop() || '');
  if (!id) return new Response('Not found', { status: 404 });

  const photoStore = getStore('drippy-photos');
  const buf = await photoStore.get('photo-' + id, { type: 'arrayBuffer' });
  if (!buf) return new Response('Not found', { status: 404 });

  const meta = await photoStore.getMetadata('photo-' + id).catch(() => null);
  const contentType = (meta && meta.metadata && meta.metadata.contentType) || 'image/png';

  return new Response(buf, {
    headers: {
      'content-type': contentType,
      'cache-control': 'public, max-age=300'
    }
  });
};

export const config = { path: '/api/photo/:id' };
