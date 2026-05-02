import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

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

function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) return null;
  return Buffer.from(hex, 'hex');
}

function encryptValue(value) {
  const key = getKey();
  if (!key) return value;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = JSON.stringify(value);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return 'enc:v1:' + Buffer.concat([iv, tag, enc]).toString('base64');
}

function decryptValue(payload) {
  if (typeof payload !== 'string' || !payload.startsWith('enc:v1:')) return payload;
  const key = getKey();
  if (!key) return payload;
  try {
    const data = Buffer.from(payload.slice(7), 'base64');
    const iv = data.slice(0, 12);
    const tag = data.slice(12, 28);
    const enc = data.slice(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
    return JSON.parse(plain);
  } catch {
    return payload;
  }
}

function encryptPrivate(data) {
  const out = { ...data };
  for (const f of PRIVATE_FIELDS) {
    if (out[f] !== undefined && out[f] !== null) out[f] = encryptValue(out[f]);
  }
  return out;
}

function decryptPrivate(data) {
  const out = { ...data };
  for (const f of PRIVATE_FIELDS) {
    if (out[f] !== undefined && out[f] !== null) out[f] = decryptValue(out[f]);
  }
  return out;
}

export default async (req) => {
  const store = getStore('drippy');

  if (req.method === 'GET') {
    const data = (await store.get(KEY, { type: 'json' })) || {};
    if (req.headers.get('authorization')) {
      if (!isAuthorized(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      return Response.json(decryptPrivate(data));
    }
    const pub = { ...data };
    PRIVATE_FIELDS.forEach(f => delete pub[f]);
    return Response.json(pub);
  }

  if (req.method === 'PUT') {
    const body = await req.json().catch(() => ({}));
    if (isAuthorized(req)) {
      await store.setJSON(KEY, encryptPrivate(body || {}));
      return Response.json({ ok: true });
    }
    const current = (await store.get(KEY, { type: 'json' })) || {};
    const decrypted = decryptPrivate(current);
    const merged = { ...decrypted };
    for (const f of PUBLIC_APPENDABLE) {
      if (body[f] !== undefined) merged[f] = body[f];
    }
    await store.setJSON(KEY, encryptPrivate(merged));
    return Response.json({ ok: true });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/settings' };
