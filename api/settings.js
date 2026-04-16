const { put, list } = require('@vercel/blob');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'admin-settings.json' });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        const data = await response.json();
        return res.status(200).json(data);
      }
    } catch {}
    return res.status(200).json({});
  }

  if (req.method === 'PUT') {
    try {
      const settings = req.body || {};
      await put('admin-settings.json', JSON.stringify(settings), {
        access: 'public',
        addRandomSuffix: false
      });
      return res.status(200).json(settings);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save: ' + e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
