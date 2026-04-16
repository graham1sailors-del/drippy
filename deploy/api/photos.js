const { put, list, del } = require('@vercel/blob');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - return all product photos mapping
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'photos-map.json' });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        const data = await response.json();
        return res.status(200).json(data);
      }
    } catch {}
    return res.status(200).json({});
  }

  // POST - upload a photo for a product
  if (req.method === 'POST') {
    try {
      const { productId, dataUrl } = req.body || {};
      if (!productId || !dataUrl) return res.status(400).json({ error: 'Missing productId or dataUrl' });

      // Upload the image to blob
      const base64Data = dataUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const contentType = dataUrl.split(';')[0].split(':')[1] || 'image/png';
      const blob = await put('product-photo-' + productId + '.png', buffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: contentType
      });

      // Update the photos map
      let photosMap = {};
      try {
        const { blobs } = await list({ prefix: 'photos-map.json' });
        if (blobs.length > 0) {
          const response = await fetch(blobs[0].url);
          photosMap = await response.json();
        }
      } catch {}

      photosMap[productId] = blob.url;
      await put('photos-map.json', JSON.stringify(photosMap), {
        access: 'public',
        addRandomSuffix: false
      });

      return res.status(200).json({ url: blob.url, photosMap });
    } catch (e) {
      return res.status(500).json({ error: 'Upload failed: ' + e.message });
    }
  }

  // DELETE - remove a product photo
  if (req.method === 'DELETE') {
    try {
      const { productId } = req.body || {};
      if (!productId) return res.status(400).json({ error: 'Missing productId' });

      // Remove from blob
      try {
        const { blobs } = await list({ prefix: 'product-photo-' + productId });
        for (const blob of blobs) {
          await del(blob.url);
        }
      } catch {}

      // Update the photos map
      let photosMap = {};
      try {
        const { blobs } = await list({ prefix: 'photos-map.json' });
        if (blobs.length > 0) {
          const response = await fetch(blobs[0].url);
          photosMap = await response.json();
        }
      } catch {}

      delete photosMap[productId];
      await put('photos-map.json', JSON.stringify(photosMap), {
        access: 'public',
        addRandomSuffix: false
      });

      return res.status(200).json({ photosMap });
    } catch (e) {
      return res.status(500).json({ error: 'Delete failed: ' + e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
