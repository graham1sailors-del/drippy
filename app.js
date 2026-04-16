// ===== PRODUCT DATA =====
const products = {
  tshirts: [
    { id: 1, name: "Midnight Drip Tee", desc: "Oversized fit, 100% organic cotton", price: 45, emoji: "🖤", badge: "NEW", colors: ["White"], sizes: ["Youth S", "Youth M", "Youth L"] },
    { id: 2, name: "Neon Pulse Tee", desc: "Reflective print, relaxed fit", price: 55, emoji: "💜", badge: "HOT", colors: ["White"], sizes: ["Youth S", "Youth M", "Youth L"] },
    { id: 3, name: "Cloud Nine Tee", desc: "Ultra-soft heavyweight cotton", price: 50, emoji: "☁️", badge: null, colors: ["White"], sizes: ["Youth S", "Youth M", "Youth L"] },
    { id: 4, name: "Flame Logo Tee", desc: "Embroidered logo, boxy cut", price: 48, emoji: "🔥", badge: "SALE", colors: ["White"], sizes: ["Youth S", "Youth M", "Youth L"] },
    { id: 5, name: "Static Tee", desc: "All-over distressed print", price: 52, emoji: "⚡", badge: null, colors: ["White"], sizes: ["Youth S", "Youth M", "Youth L"] },
    { id: 6, name: "Ghost Tee", desc: "Glow-in-dark graphic", price: 58, emoji: "👻", badge: "LIMITED", colors: ["White"], sizes: ["Youth S", "Youth M", "Youth L"] },
    { id: 7, name: "Wave Rider Tee", desc: "Washed vintage finish", price: 46, emoji: "🌊", badge: null, colors: ["White"], sizes: ["Youth S", "Youth M", "Youth L"] },
    { id: 8, name: "Prism Tee", desc: "Holographic foil detail", price: 60, emoji: "🔮", badge: "NEW", colors: ["White"], sizes: ["Youth S", "Youth M", "Youth L"] },
  ],
  sweatshirts: [
    { id: 101, name: "Arctic Hoodie", desc: "Sherpa-lined, heavyweight fleece", price: 95, emoji: "❄️", badge: "BEST SELLER", colors: ["White", "Grey"] },
    { id: 102, name: "Phantom Crewneck", desc: "Puff print logo, 400gsm", price: 85, emoji: "🌑", badge: null, colors: ["Black", "Charcoal"] },
    { id: 103, name: "Sunset Hoodie", desc: "Gradient dye, oversized", price: 110, emoji: "🌅", badge: "NEW", colors: ["Orange", "Pink"] },
    { id: 104, name: "Thunder Zip-Up", desc: "Full zip, embroidered back", price: 105, emoji: "⛈️", badge: null, colors: ["Navy", "Black"] },
    { id: 105, name: "Plush Crewneck", desc: "Brushed inner fleece", price: 80, emoji: "🧸", badge: "SALE", colors: ["Cream", "Brown"] },
    { id: 106, name: "Vapor Hoodie", desc: "Tech fabric, water-resistant", price: 120, emoji: "💨", badge: "LIMITED", colors: ["Grey", "Silver"] },
    { id: 107, name: "Bloom Hoodie", desc: "Floral embroidered patch", price: 98, emoji: "🌸", badge: null, colors: ["Pink", "Black"] },
    { id: 108, name: "Eclipse Pullover", desc: "Half-zip, mock neck", price: 90, emoji: "🌘", badge: "HOT", colors: ["Black", "Purple"] },
  ]
};

const gradients = [
  "linear-gradient(135deg, #1a1a2e, #16213e)",
  "linear-gradient(135deg, #2d1b69, #11001c)",
  "linear-gradient(135deg, #1b2838, #0d1b2a)",
  "linear-gradient(135deg, #2b1055, #d53a9d20)",
  "linear-gradient(135deg, #0f2027, #203a43)",
  "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
  "linear-gradient(135deg, #16222a, #3a6073)",
  "linear-gradient(135deg, #1e1e2e, #2a1a3e)",
];

// ===== QR CODE GENERATOR =====
function generateQR(canvas, text, size) {
  // Use an image from a QR API since building a full QR encoder is complex
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
  };
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(text);
}

// ===== SECURITY: HTML SANITIZER =====
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== SECURITY: PASSWORD HASHING (SHA-256) =====
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'DRIPPY_SALT_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== SECURITY: LOGIN RATE LIMITING =====
const loginAttempts = {};
function checkRateLimit(email) {
  const now = Date.now();
  if (!loginAttempts[email]) loginAttempts[email] = [];
  // Remove attempts older than 15 minutes
  loginAttempts[email] = loginAttempts[email].filter(t => now - t < 900000);
  if (loginAttempts[email].length >= 5) {
    const waitTime = Math.ceil((900000 - (now - loginAttempts[email][0])) / 60000);
    showToast('Too many failed attempts. Try again in ' + waitTime + ' minutes.');
    return false;
  }
  return true;
}
function recordFailedAttempt(email) {
  if (!loginAttempts[email]) loginAttempts[email] = [];
  loginAttempts[email].push(Date.now());
}
function clearAttempts(email) {
  delete loginAttempts[email];
}

// ===== SECURITY: ENCRYPT/DECRYPT PAYMENT DATA =====
function encryptData(data) {
  // Simple obfuscation for localStorage — not a substitute for server-side encryption
  return btoa(encodeURIComponent(JSON.stringify(data)));
}
function decryptData(data) {
  try { return JSON.parse(decodeURIComponent(atob(data))); }
  catch { return null; }
}

// ===== CACHE BUSTER =====
const DRIPPY_VERSION = '2.0';
if (localStorage.getItem('drippy_version') !== DRIPPY_VERSION) {
  const keysToKeep = ['drippy_user'];
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('drippy_') && !keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem('drippy_version', DRIPPY_VERSION);
}

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('drippy_cart') || '[]');
let currentUser = JSON.parse(localStorage.getItem('drippy_user') || 'null');
let subscriberDB = JSON.parse(localStorage.getItem('drippy_subscribers') || '[]');
let usersDB = JSON.parse(localStorage.getItem('drippy_users') || '[]');

// ===== SERVER SETTINGS (replaces localStorage for admin data) =====
let _s = {
  prices: {}, names: {}, badges: {}, sizes: {}, colors: {},
  deleted: [], custom_products: [], custom_settings: {},
  orders: [], purchased_custom: [], custom_orders: {}, sales: {},
  admin_email: ''
};

function loadServerSettings() {
  return fetch('/api/settings').then(r => r.json()).then(data => {
    if (data && typeof data === 'object') {
      Object.keys(_s).forEach(k => { if (data[k] !== undefined) _s[k] = data[k]; });
    }
  }).catch(() => {});
}

function saveServerSettings() {
  return fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(_s)
  }).catch(() => {});
}

// ===== CUSTOM SETTINGS UI (admin) =====
function loadCustomSettingsUI() {
  const cs = _s.custom_settings || {};
  const el = id => document.getElementById(id);
  if (el('customTeePrice')) el('customTeePrice').value = cs.tee_price || 55;
  if (el('customTeeSizes')) el('customTeeSizes').value = cs.tee_sizes || 'Youth S, Youth M, Youth L';
  if (el('customSweatPrice')) el('customSweatPrice').value = cs.sweat_price || 85;
  if (el('customSweatSizes')) el('customSweatSizes').value = cs.sweat_sizes || 'S, M, L, XL, XXL';
}

function saveCustomSettings() {
  _s.custom_settings = {
    tee_price: parseInt(document.getElementById('customTeePrice').value) || 55,
    tee_sizes: document.getElementById('customTeeSizes').value.trim() || 'Youth S, Youth M, Youth L',
    sweat_price: parseInt(document.getElementById('customSweatPrice').value) || 85,
    sweat_sizes: document.getElementById('customSweatSizes').value.trim() || 'S, M, L, XL, XXL'
  };
  saveServerSettings();
  refreshStorefront();
  showToast('Custom product settings saved!');
}

// ===== LOAD CUSTOM PRODUCTS =====
function loadCustomProducts() {
  const cp = _s.custom_products || [];
  cp.forEach(p => {
    if (p.category === 'tshirts') products.tshirts.push(p);
    else products.sweatshirts.push(p);
  });
}

// ===== DELETED PRODUCTS FILTER =====
function getActiveProducts(list) {
  const deleted = _s.deleted || [];
  return list.filter(p => !deleted.includes(p.id));
}

// ===== REFRESH STOREFRONT (called after any admin change) =====
function refreshStorefront() {
  // Reload custom products into product arrays
  const freshCustom = _s.custom_products || [];
  products.tshirts = products.tshirts.filter(p => p.id <= 100);
  products.sweatshirts = products.sweatshirts.filter(p => p.id <= 200 && p.id >= 100);
  freshCustom.forEach(cp => {
    if (cp.category === 'tshirts') products.tshirts.push(cp);
    else products.sweatshirts.push(cp);
  });

  const activeTees = getActiveProducts(products.tshirts);
  const activeSweats = getActiveProducts(products.sweatshirts);
  renderProducts('tshirtGrid', activeTees);
  renderProducts('sweatshirtGrid', activeSweats);
  const teeCount = document.getElementById('teeCount');
  const sweatCount = document.getElementById('sweatCount');
  if (teeCount) teeCount.textContent = activeTees.length;
  if (sweatCount) sweatCount.textContent = activeSweats.length;
  updateCartCount();
  updateBestSellers();
}


// ===== LOAD PHOTOS FROM SERVER =====
function loadServerPhotos() {
  return fetch('/api/photos').then(r => r.json()).then(data => {
    if (data && typeof data === 'object') {
      _productPhotos = data;
      productPhotos = data;
    }
  }).catch(() => {});
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  Promise.all([loadServerSettings(), loadServerPhotos()]).then(() => {
    loadCustomProducts();
    refreshStorefront();
  });
  refreshStorefront();
  if (currentUser) updateAuthUI();
  updateNewsletterState();
});

// ===== CROSS-TAB SYNC: if admin changes in another tab, storefront updates live =====
window.addEventListener('storage', (e) => {
  if (['drippy_prices', 'drippy_names', 'drippy_badges', 'drippy_deleted', 'drippy_custom_products', 'drippy_sales', 'drippy_product_photos'].includes(e.key)) {
    refreshStorefront();
  }
  if (e.key === 'drippy_cart') {
    cart = JSON.parse(localStorage.getItem('drippy_cart') || '[]');
    updateCartCount();
  }
});

// ===== NAVIGATION =====
function showPage(pageId) {
  // Track last page for back button
  const current = document.querySelector('.page.active');
  if (current) window._lastPage = current.id.replace('page-', '');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  window.scrollTo(0, 0);
  if (pageId === 'checkout') renderCart();
}

function showProductPage(productId) {
  const allProducts = [...getActiveProducts(products.tshirts), ...getActiveProducts(products.sweatshirts)];
  const p = allProducts.find(item => item.id === productId);
  if (!p) return;

  const name = getName(p);
  const price = getPrice(p);
  const type = p.id >= 100 ? 'Sweatshirt' : 'T-Shirt';
  const gradient = gradients[allProducts.indexOf(p) % gradients.length];

  const photo = getProductPhoto(p.id);
  const sizes = getProductSizes(p);
  const colors = getProductColors(p);
  window._selectedSize = null;
  window._selectedColor = colors.length === 1 ? colors[0] : null;

  document.getElementById('productDetail').innerHTML = `
    <div class="pd-image" style="background: ${gradient}">
      ${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;border-radius:inherit;">` : `<span>${p.emoji}</span>`}
      ${getBadge(p) ? `<span class="pd-badge">${getBadge(p)}</span>` : ''}
    </div>
    <div class="pd-info">
      <div class="pd-name">${name}</div>
      <div class="pd-price">$${price}</div>
      <div class="pd-desc">${p.desc}</div>
      <div class="pd-meta">
        <div class="pd-meta-row"><i class="fas fa-tag"></i> ${type}</div>
        ${colors.length > 1 ? `
        <div class="pd-meta-row"><i class="fas fa-palette"></i> Color:</div>
        <div class="pd-selector" id="colorSelector">
          ${colors.map(c => `<button class="pd-option-btn" onclick="selectOption(this, 'color', '${sanitizeHTML(c)}')">${sanitizeHTML(c)}</button>`).join('')}
        </div>
        ` : `
        <div class="pd-meta-row"><i class="fas fa-palette"></i> Color: ${sanitizeHTML(colors[0] || 'White')}</div>
        `}
        <div class="pd-meta-row"><i class="fas fa-ruler"></i> Size:</div>
        <div class="pd-selector" id="sizeSelector">
          ${sizes.map(s => `<button class="pd-option-btn" onclick="selectOption(this, 'size', '${sanitizeHTML(s)}')">${sanitizeHTML(s)}</button>`).join('')}
        </div>
        <div class="pd-meta-row"><i class="fas fa-truck"></i> Free shipping over $75</div>
      </div>
      <div class="pd-actions">
        <button class="btn btn-primary" onclick="addToCartWithOptions(${p.id})"><i class="fas fa-shopping-bag"></i> Add to Bag</button>
        <button class="btn btn-outline" onclick="showPage('checkout')"><i class="fas fa-arrow-right"></i> Checkout</button>
      </div>
    </div>
  `;

  showPage('product');
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.querySelector('.mobile-menu-btn i');
  menu.classList.toggle('active');
  if (menu.classList.contains('active')) {
    btn.className = 'fas fa-times';
    document.body.style.overflow = 'hidden';
  } else {
    btn.className = 'fas fa-bars';
    document.body.style.overflow = '';
  }
}

// ===== CATEGORY FILTERS =====
function filterProducts(category, badge, btn) {
  const source = category === 'tshirts' ? products.tshirts : products.sweatshirts;
  const active = getActiveProducts(source);
  const gridId = category === 'tshirts' ? 'tshirtGrid' : 'sweatshirtGrid';

  const filtered = badge === 'all' ? active : active.filter(p => p.badge === badge);
  renderProducts(gridId, filtered);

  btn.closest('.category-filter-bar').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ===== PRICE, NAME & BADGE OVERRIDES =====
function getPrice(product) {
  return _s.prices[product.id] !== undefined ? _s.prices[product.id] : product.price;
}

function getName(product) {
  return _s.names[product.id] !== undefined ? _s.names[product.id] : product.name;
}

function getBadge(product) {
  if (_s.badges[product.id] !== undefined) return _s.badges[product.id] || null;
  return product.badge;
}

function getProductSizes(product) {
  if (_s.sizes[product.id]) return _s.sizes[product.id].split(',').map(s => s.trim());
  return product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
}

function getProductColors(product) {
  if (_s.colors[product.id]) return _s.colors[product.id].split(',').map(c => c.trim());
  return product.colors || ['Black', 'White'];
}

function getCustomPrice(type) {
  const cs = _s.custom_settings || {};
  return type === 'tee' ? (cs.tee_price || 55) : (cs.sweat_price || 85);
}

function getCustomSizes(type) {
  const cs = _s.custom_settings || {};
  const raw = type === 'tee' ? (cs.tee_sizes || 'Youth S, Youth M, Youth L') : (cs.sweat_sizes || 'S, M, L, XL, XXL');
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// ===== PRODUCTS =====
let _productPhotos = {};
function getProductPhoto(productId) {
  return _productPhotos[productId] || null;
}

function renderProducts(gridId, items) {
  const grid = document.getElementById(gridId);
  const isTshirts = gridId === 'tshirtGrid';
  const customPage = isTshirts ? 'custom-tee' : 'custom-sweat';
  const customPrice = isTshirts ? getCustomPrice('tee') : getCustomPrice('sweat');
  const customLabel = isTshirts ? 'T-Shirt' : 'Sweatshirt';

  let html = items.map((p, i) => {
    const badge = getBadge(p);
    const photo = getProductPhoto(p.id);
    return `
    <div class="product-card" onclick="showProductPage(${p.id})" style="cursor:pointer;">
      <div class="product-image" style="background: ${gradients[i % gradients.length]}">
        ${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;border-radius:inherit;">` : `<span>${p.emoji}</span>`}
        ${badge ? `<span class="product-badge">${badge}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${getName(p)}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-bottom">
          <span class="product-price">$${getPrice(p)}</span>
          <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id})" title="Add to bag">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `}).join('');

  // Add "Design Your Own" card at the end
  html += `
    <div class="product-card" onclick="showPage('${customPage}')" style="cursor:pointer;">
      <div class="product-image" style="background: linear-gradient(135deg, #7c3aed, #a855f7);">
        <span style="font-size:3rem;"><i class="fas fa-paint-brush" style="color:#fff;"></i></span>
        <span class="product-badge" style="background:linear-gradient(135deg,#fff,#f0f0f0);color:#7c3aed;">CUSTOM</span>
      </div>
      <div class="product-info">
        <div class="product-name">Design Your Own ${customLabel}</div>
        <div class="product-desc">Custom text, fonts, graphics & colors</div>
        <div class="product-bottom">
          <span class="product-price">From $${customPrice}</span>
          <button class="add-to-cart" onclick="event.stopPropagation(); showPage('${customPage}')" title="Start designing" style="background:#7c3aed;">
            <i class="fas fa-arrow-right" style="color:#fff;"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  grid.innerHTML = html;
}

// ===== CART =====
function findProduct(id) {
  return [...getActiveProducts(products.tshirts), ...getActiveProducts(products.sweatshirts)].find(p => p.id === id);
}

function selectOption(btn, type, value) {
  const parent = btn.parentElement;
  parent.querySelectorAll('.pd-option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  if (type === 'size') window._selectedSize = value;
  if (type === 'color') window._selectedColor = value;
}

function addToCartWithOptions(productId) {
  if (!window._selectedSize) {
    showToast('Please select a size');
    return;
  }
  const colors = getProductColors(findProduct(productId) || {});
  if (colors.length > 1 && !window._selectedColor) {
    showToast('Please select a color');
    return;
  }
  const existing = cart.find(item => item.id === productId && item.size === window._selectedSize && item.color === (window._selectedColor || ''));
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: productId, qty: 1, size: window._selectedSize, color: window._selectedColor || colors[0] || '' });
  }
  saveCart();
  updateCartCount();
  showToast('Added to your bag! (' + window._selectedSize + ')');
}

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  saveCart();
  updateCartCount();
  showToast('Added to your bag!');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartCount();
  renderCart();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeFromCart(productId);
  saveCart();
  updateCartCount();
  renderCart();
}

function saveCart() {
  localStorage.setItem('drippy_cart', JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const summary = document.getElementById('orderSummary');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-bag"></i>
        <h3>Your bag is empty</h3>
        <p>Add some drip to get started</p>
        <button class="btn btn-primary" onclick="showPage('tshirts')">Start Shopping</button>
      </div>
    `;
    summary.style.display = 'none';
    return;
  }

  summary.style.display = 'block';
  setTimeout(() => {
    loadSavedPayment();
    const qrCanvas = document.getElementById('venmoQR');
    if (qrCanvas) generateQR(qrCanvas, 'https://gl.me/u/bqGDz26h4Lcv', 180);
  }, 50);

  let html = '';
  let subtotal = 0;
  cart.forEach(item => {
    const p = findProduct(item.id);
    if (!p) return;
    const price = getPrice(p);
    const itemTotal = price * item.qty;
    subtotal += itemTotal;
    const sizeInfo = item.size ? ` — ${item.size}` : '';
    const colorInfo = item.color ? ` / ${item.color}` : '';
    const photo = getProductPhoto(p.id);
    html += `
      <div class="cart-item">
        <div class="cart-item-image">${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : p.emoji}</div>
        <div class="cart-item-details">
          <div class="cart-item-name">${getName(p)}</div>
          <div class="cart-item-meta">${p.desc}${sizeInfo}${colorInfo}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty(${p.id}, -1)"><i class="fas fa-minus"></i></button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${p.id}, 1)"><i class="fas fa-plus"></i></button>
        </div>
        <div class="cart-item-price">$${itemTotal}</div>
        <button class="cart-item-remove" onclick="removeFromCart(${p.id})"><i class="fas fa-trash"></i></button>
      </div>
    `;
  });

  container.innerHTML = html;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('tax').textContent = '$' + tax.toFixed(2);
  document.getElementById('total').textContent = '$' + total.toFixed(2);

  // Show exact amount on pay button and QR
  const qrAmount = document.getElementById('qrPayAmount');
  if (qrAmount) qrAmount.textContent = 'Send exactly: $' + total.toFixed(2);
  const mobileBtn = document.getElementById('mobilePayBtn');
  if (mobileBtn) mobileBtn.innerHTML = '<i class="fas fa-credit-card" style="margin-right:6px;"></i> Pay $' + total.toFixed(2);
}

function loadSavedPayment() {
  // No payment form fields — placeholder for future use
}

function processCheckout() {
  if (cart.length === 0) return;
  if (!currentUser) {
    showPage('login');
    showToast('Please log in or sign up to checkout');
    return;
  }

  // Validate shipping address
  const sName = (document.getElementById('shipName')?.value || '').trim();
  const sAddr = (document.getElementById('shipAddress')?.value || '').trim();
  const sCity = (document.getElementById('shipCity')?.value || '').trim();
  const sState = (document.getElementById('shipState')?.value || '').trim();
  const sZip = (document.getElementById('shipZip')?.value || '').trim();

  if (!sName || !sAddr || !sCity || !sState || !sZip) {
    showToast('Please fill in all shipping address fields');
    return;
  }
  // Name: at least 2 words, letters/spaces/hyphens only
  if (!/^[a-zA-Z\s\-]{2,}(\s[a-zA-Z\s\-]{1,})+$/.test(sName)) {
    showToast('Please enter your full name (first and last)');
    return;
  }
  // Street: must start with a number followed by letters (e.g. 123 Main St)
  if (!/^\d+\s+[a-zA-Z]/.test(sAddr)) {
    showToast('Please enter a valid street address (e.g. 123 Main St)');
    return;
  }
  // City: letters, spaces, hyphens only, at least 2 chars
  if (!/^[a-zA-Z\s\-]{2,}$/.test(sCity)) {
    showToast('Please enter a valid city name');
    return;
  }
  // State: exactly 2 letters (abbreviation)
  if (!/^[a-zA-Z]{2}$/.test(sState)) {
    showToast('Please enter a 2-letter state code (e.g. CA, NY)');
    return;
  }
  // ZIP: 5 digits or 5+4 format
  if (!/^\d{5}(-\d{4})?$/.test(sZip)) {
    showToast('Please enter a valid ZIP code (e.g. 90210)');
    return;
  }

  // Save custom orders to admin
  const customOrders = _s.custom_orders || [];
  cart.forEach(item => {
    if (typeof item.id === 'string' && item.id.startsWith('custom-')) {
      const order = (Array.isArray(customOrders) ? customOrders : []).find(o => o.id === item.id);
      if (order) {
        _s.purchased_custom.push({
          ...order,
          qty: item.qty,
          buyer: currentUser.name,
          buyerEmail: currentUser.email,
          date: new Date().toISOString()
        });
      }
    }
  });

  // Record sales
  cart.forEach(item => {
    _s.sales[item.id] = (_s.sales[item.id] || 0) + item.qty;
  });

  // Save full order to orders list
  const allOrders = _s.orders || [];
  let orderSubtotal = 0;
  const orderItems = cart.map(item => {
    const p = findProduct(item.id);
    if (!p) return null;
    const price = getPrice(p);
    orderSubtotal += price * item.qty;
    const orderItem = { name: getName(p), qty: item.qty, price: price, size: item.size || '', color: item.color || '' };
    // Attach preview image for custom items
    if (typeof item.id === 'string' && item.id.startsWith('custom-')) {
      const co = Array.isArray(_s.custom_orders) ? _s.custom_orders : [];
      const customData = co.find(o => o.id === item.id);
      if (customData && customData.previewImage) orderItem.previewImage = customData.previewImage;
    }
    return orderItem;
  }).filter(Boolean);
  const orderTax = orderSubtotal * 0.08;
  const shipName = document.getElementById('shipName');
  const shipAddr = document.getElementById('shipAddress');
  const shipCity = document.getElementById('shipCity');
  const shipState = document.getElementById('shipState');
  const shipZip = document.getElementById('shipZip');
  const address = {
    name: shipName ? shipName.value.trim() : '',
    street: shipAddr ? shipAddr.value.trim() : '',
    city: shipCity ? shipCity.value.trim() : '',
    state: shipState ? shipState.value.trim() : '',
    zip: shipZip ? shipZip.value.trim() : ''
  };
  allOrders.push({
    id: 'ORD-' + Date.now(),
    customer: currentUser.name,
    email: currentUser.email,
    address: address,
    items: orderItems,
    subtotal: orderSubtotal,
    tax: orderTax,
    total: orderSubtotal + orderTax,
    date: new Date().toISOString(),
    status: 'Pending'
  });
  _s.orders = allOrders;
  saveServerSettings();

  // Update best seller badges
  updateBestSellers();

  showToast('Order placed! Thanks for shopping with DRIPPY!');
  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
}

// ===== BEST SELLER TRACKING =====
function updateBestSellers() {
  const salesData = _s.sales || {};
  const deleted = _s.deleted || [];

  // Find top seller in tshirts
  let topTee = null, topTeeQty = 0;
  products.tshirts.forEach(p => {
    if (deleted.includes(p.id)) return;
    const sold = salesData[p.id] || 0;
    if (sold > topTeeQty) { topTee = p.id; topTeeQty = sold; }
  });

  // Find top seller in sweatshirts
  let topSweat = null, topSweatQty = 0;
  products.sweatshirts.forEach(p => {
    if (deleted.includes(p.id)) return;
    const sold = salesData[p.id] || 0;
    if (sold > topSweatQty) { topSweat = p.id; topSweatQty = sold; }
  });

  // Clear old BEST SELLER badges, set new ones
  [...products.tshirts, ...products.sweatshirts].forEach(p => {
    if (p.badge === 'BEST SELLER') p.badge = null;
  });
  if (topTee && topTeeQty > 0) {
    products.tshirts.find(p => p.id === topTee).badge = 'BEST SELLER';
  }
  if (topSweat && topSweatQty > 0) {
    products.sweatshirts.find(p => p.id === topSweat).badge = 'BEST SELLER';
  }

  // Re-render grids
  const activeTees = getActiveProducts(products.tshirts);
  const activeSweats = getActiveProducts(products.sweatshirts);
  renderProducts('tshirtGrid', activeTees);
  renderProducts('sweatshirtGrid', activeSweats);
}

// ===== ADMIN ACCOUNT =====
const ADMIN_ACCOUNT_EMAIL = '1.2.3drippy.tdu';
const ADMIN_ACCOUNT_PASSWORD = '1.34.32./587';

// ===== AUTH =====
function switchAuth(mode) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  if (mode === 'login') {
    document.querySelector('.auth-tab:first-child').classList.add('active');
    document.getElementById('loginForm').classList.add('active');
  } else {
    document.querySelector('.auth-tab:last-child').classList.add('active');
    document.getElementById('signupForm').classList.add('active');
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleLogin(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input');
  const email = inputs[0].value.trim().toLowerCase();
  const password = inputs[1].value;

  if (!email) {
    showToast('Please enter your email or username.');
    return;
  }
  if (!password) {
    showToast('Please enter your password.');
    return;
  }
  if (!checkRateLimit(email)) return;

  // Check admin account first
  if (email === ADMIN_ACCOUNT_EMAIL && password === ADMIN_ACCOUNT_PASSWORD) {
    clearAttempts(email);
    currentUser = { email: ADMIN_ACCOUNT_EMAIL, name: 'Admin' };
    localStorage.setItem('drippy_user', JSON.stringify(currentUser));
    updateAuthUI();
    showToast('Welcome back, Admin!');
    showPage('home');
    return;
  }

  const account = usersDB.find(u => u.email === email);
  if (!account) {
    recordFailedAttempt(email);
    // Generic message to prevent email enumeration
    showToast('Invalid email or password.');
    return;
  }

  const hashedInput = await hashPassword(password);
  // Support both hashed and legacy plain-text passwords
  const passwordMatch = account.password === hashedInput ||
    (account.password.length < 64 && account.password === password);

  if (!passwordMatch) {
    recordFailedAttempt(email);
    showToast('Invalid email or password.');
    return;
  }

  // Upgrade legacy plain-text password to hashed
  if (account.password.length < 64) {
    account.password = hashedInput;
    localStorage.setItem('drippy_users', JSON.stringify(usersDB));
  }

  clearAttempts(email);
  currentUser = { email: account.email, name: account.name };
  localStorage.setItem('drippy_user', JSON.stringify(currentUser));
  updateAuthUI();
  updateNewsletterState();
  showToast('Welcome back, ' + sanitizeHTML(currentUser.name) + '!');
  showPage('home');
}

async function handleSignup(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input');
  const firstName = inputs[0].value.trim();
  const lastName = inputs[1].value.trim();
  const email = inputs[2].value.trim().toLowerCase();
  const password = inputs[3].value;

  // If admin tries to sign up, redirect to login
  if (email === ADMIN_ACCOUNT_EMAIL) {
    showToast('Admin account detected. Use Login instead.');
    switchAuth('login');
    const loginInputs = document.getElementById('loginForm').querySelectorAll('input');
    loginInputs[0].value = email;
    return;
  }

  if (!firstName || !lastName) {
    showToast('Please enter your full name.');
    return;
  }
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address.');
    return;
  }
  if (password.length < 8) {
    showToast('Password must be at least 8 characters.');
    return;
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    showToast('Password needs uppercase, lowercase, and a number.');
    return;
  }

  // Check if account already exists
  const exists = usersDB.some(u => u.email === email);
  if (exists) {
    showToast('An account with that email already exists. Please log in.');
    switchAuth('login');
    const loginInputs = document.getElementById('loginForm').querySelectorAll('input');
    loginInputs[0].value = email;
    return;
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    name: sanitizeHTML(firstName) + ' ' + sanitizeHTML(lastName),
    email: email,
    password: hashedPassword
  };
  usersDB.push(newUser);
  localStorage.setItem('drippy_users', JSON.stringify(usersDB));

  currentUser = { name: newUser.name, email: email };
  localStorage.setItem('drippy_user', JSON.stringify(currentUser));
  updateAuthUI();
  updateNewsletterState();
  showToast('Welcome to DRIPPY, ' + sanitizeHTML(currentUser.name) + '!');
  showPage('home');
}

function updateAuthUI() {
  const icon = document.getElementById('accountIcon');
  const info = document.getElementById('accountInfo');
  const adminLink = document.getElementById('adminLink');
  if (currentUser) {
    icon.className = 'fas fa-user-check';
    icon.parentElement.style.color = '#7c3aed';
    info.innerHTML = `<strong>${sanitizeHTML(currentUser.name)}</strong>${sanitizeHTML(currentUser.email)}`;
    // Show admin link only for admin account
    if (adminLink) adminLink.style.display = (currentUser.email === ADMIN_ACCOUNT_EMAIL) ? 'inline-flex' : 'none';
  } else {
    icon.className = 'fas fa-user';
    icon.parentElement.style.color = '';
    info.innerHTML = '';
    if (adminLink) adminLink.style.display = 'none';
  }
}

function toggleAccountMenu() {
  if (!currentUser) {
    showPage('login');
    return;
  }
  document.getElementById('accountDropdown').classList.toggle('active');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('drippy_user');
  document.getElementById('accountDropdown').classList.remove('active');
  updateAuthUI();
  showToast('Logged out');
  showPage('home');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('accountWrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    document.getElementById('accountDropdown').classList.remove('active');
  }
});

// ===== CHAT / AI ASSISTANT =====
function toggleChat() {
  const widget = document.getElementById('chatWidget');
  const fab = document.getElementById('chatFab');
  widget.classList.toggle('active');
  fab.style.display = widget.classList.contains('active') ? 'none' : 'flex';
}

function toggleEmailMode() {
  const bar = document.getElementById('emailBar');
  const btn = document.getElementById('emailToggle');
  if (bar.style.display === 'none') {
    bar.style.display = 'flex';
    btn.style.background = 'rgba(255,255,255,0.3)';
  } else {
    bar.style.display = 'none';
    btn.style.background = 'rgba(255,255,255,0.15)';
  }
}

function sendEmailFromChat() {
  const subject = document.getElementById('chatEmailSubject').value.trim();
  const body = document.getElementById('chatEmailBody').value.trim();
  const from = document.getElementById('chatEmailFrom').value.trim();

  if (!subject) return showToast('Please enter a subject');
  if (!body) return showToast('Please write a message');
  if (!from) return showToast('Please enter your name');

  const fullBody = body + '\n\n— From: ' + from;
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(fullBody);
  window.open(`mailto:drippy123.345@gmail.com?subject=${encodedSubject}&body=${encodedBody}`);

  // Clear form
  document.getElementById('chatEmailSubject').value = '';
  document.getElementById('chatEmailBody').value = '';
  document.getElementById('chatEmailFrom').value = '';
  toggleEmailMode();
  showToast('Opening email to DRIPPY!');
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  input.value = '';

  // Show typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-message bot';
  typing.id = 'typingIndicator';
  typing.innerHTML = '<div class="message-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  document.getElementById('chatMessages').appendChild(typing);
  scrollChat();

  setTimeout(() => {
    document.getElementById('typingIndicator')?.remove();
    const response = getAIResponse(text);
    appendMessage(response, 'bot');
  }, 800 + Math.random() * 800);
}

function appendMessage(text, sender) {
  const div = document.createElement('div');
  div.className = 'chat-message ' + sender;
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  if (sender === 'user') {
    bubble.textContent = text; // User input: never render as HTML
  } else {
    bubble.innerHTML = text; // Bot responses: safe, generated by our code
  }
  div.appendChild(bubble);
  document.getElementById('chatMessages').appendChild(div);
  scrollChat();
}

function scrollChat() {
  const msgs = document.getElementById('chatMessages');
  msgs.scrollTop = msgs.scrollHeight;
}

// ===== LIVE PRODUCT HELPERS FOR AI =====
function getLiveCatalog() {
  const allProducts = [...getActiveProducts(products.tshirts), ...getActiveProducts(products.sweatshirts)];
  return allProducts.map(p => ({ ...p, livePrice: getPrice(p), name: getName(p), badge: getBadge(p) }));
}

function getLiveTshirts() {
  return getActiveProducts(products.tshirts).map(p => ({ ...p, livePrice: getPrice(p), name: getName(p), badge: getBadge(p) }));
}

function getLiveSweatshirts() {
  return getActiveProducts(products.sweatshirts).map(p => ({ ...p, livePrice: getPrice(p), name: getName(p), badge: getBadge(p) }));
}

function getCheapest(items) {
  return items.reduce((min, p) => p.livePrice < min.livePrice ? p : min, items[0]);
}

function getMostExpensive(items) {
  return items.reduce((max, p) => p.livePrice > max.livePrice ? p : max, items[0]);
}

function getPriceRange(items) {
  const prices = items.map(p => p.livePrice);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function formatProductList(items, limit) {
  return items.slice(0, limit || items.length).map(p =>
    `<b>${p.name}</b> — $${p.livePrice}`
  ).join('<br>');
}

function findProductByName(query, catalog) {
  const q = query.toLowerCase();
  return catalog.filter(p => p.name.toLowerCase().includes(q));
}

function getAIResponse(input) {
  // Pull live data every time — always current with admin changes
  const lower = input.toLowerCase();
  const catalog = getLiveCatalog();
  const tees = getLiveTshirts();
  const sweats = getLiveSweatshirts();
  const teeRange = getPriceRange(tees);
  const sweatRange = getPriceRange(sweats);

  // --- SPECIFIC PRODUCT LOOKUP (check first — highest priority) ---
  // Strip filler words, see if they named a product
  const cleaned = lower.replace(/how much|what is|what's|whats|price of|cost of|tell me about|show me|is the|for the|of the|about the|the|do you have|got any/gi, '').trim();
  const nameMatch = findProductByName(cleaned, catalog);
  if (nameMatch.length === 1) {
    const p = nameMatch[0];
    const type = p.id >= 100 ? 'sweatshirt' : 'tee';
    return `<b>${p.name}</b><br>Price: <b>$${p.livePrice}</b><br>Type: ${type}<br>${p.desc}<br>Colors: ${p.colors.join(', ')}<br>${p.badge ? 'Status: ' + p.badge : ''}`;
  }
  if (nameMatch.length > 1 && nameMatch.length <= 4) {
    return "Found " + nameMatch.length + " matches:<br><br>" + nameMatch.map(p =>
      `<b>${p.name}</b> — $${p.livePrice} (${p.desc})`
    ).join('<br>');
  }

  // --- BUDGET / PRICE RANGE ---
  const budgetMatch = lower.match(/under\s*\$?(\d+)|less than\s*\$?(\d+)|below\s*\$?(\d+)|budget\s*\$?(\d+)|max\s*\$?(\d+)|(\d+)\s*dollars|for\s*\$?(\d+)/);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3] || budgetMatch[4] || budgetMatch[5] || budgetMatch[6] || budgetMatch[7]);
    const underBudget = catalog.filter(p => p.livePrice <= budget).sort((a,b) => a.livePrice - b.livePrice);
    if (underBudget.length > 0) {
      return `${underBudget.length} item${underBudget.length > 1 ? 's' : ''} under $${budget}:<br><br>` + formatProductList(underBudget);
    }
    const cheapest = getCheapest(catalog);
    return `Nothing under $${budget}. The lowest priced item is <b>${cheapest.name}</b> at $${cheapest.livePrice}.`;
  }

  // --- PRICING ---
  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('expensive') || lower.includes('cheap')) {
    return `<b>T-Shirts:</b> $${teeRange.min} – $${teeRange.max} (${tees.length} styles)<br><b>Sweatshirts:</b> $${sweatRange.min} – $${sweatRange.max} (${sweats.length} styles)<br><br>Lowest: <b>${getCheapest(catalog).name}</b> at $${getCheapest(catalog).livePrice}<br>Highest: <b>${getMostExpensive(catalog).name}</b> at $${getMostExpensive(catalog).livePrice}<br><br>Ask about a specific item for exact pricing.`;
  }

  // --- FULL CATALOG ---
  if (lower.includes('everything') || lower.includes('full list') || lower.includes('catalog') || lower.includes('show me all') || lower.includes('what do you have') || lower.includes('what you got') || lower.includes('all products') || lower.includes('all items')) {
    return "<b>T-Shirts (${tees.length}):</b><br>".replace('${tees.length}', tees.length) + formatProductList(tees) + "<br><br><b>Sweatshirts (${sweats.length}):</b><br>".replace('${sweats.length}', sweats.length) + formatProductList(sweats);
  }

  // --- DISCOUNT / SALE ---
  if (lower.includes('discount') || lower.includes('code') || lower.includes('coupon') || lower.includes('promo')) {
    return "Active code: <b>DRIP15</b> — 15% off your first order. Applied at checkout.";
  }
  if (lower.includes('sale') || lower.includes('deal')) {
    const saleItems = catalog.filter(p => p.badge === 'SALE');
    if (saleItems.length > 0) {
      return "On sale now:<br><br>" + formatProductList(saleItems) + "<br><br>Code <b>DRIP15</b> stacks for an extra 15% off your first order.";
    }
    return "No items on sale right now. Code <b>DRIP15</b> gets you 15% off your first order though.";
  }

  // --- T-SHIRTS ---
  if (lower.includes('tshirt') || lower.includes('t-shirt') || lower.includes('tee') || lower.includes('shirt')) {
    return `We have ${tees.length} tees ($${teeRange.min} – $${teeRange.max}):<br><br>` + formatProductList(tees);
  }

  // --- SWEATSHIRTS ---
  if (lower.includes('sweatshirt') || lower.includes('hoodie') || lower.includes('crew') || lower.includes('pullover') || lower.includes('zip') || lower.includes('sweater')) {
    return `We have ${sweats.length} sweatshirts ($${sweatRange.min} – $${sweatRange.max}):<br><br>` + formatProductList(sweats);
  }

  // --- NEW / LATEST ---
  if (lower.includes('new') || lower.includes('latest') || lower.includes('just dropped') || lower.includes('recent')) {
    const newItems = catalog.filter(p => p.badge === 'NEW');
    if (newItems.length > 0) {
      return "New arrivals:<br><br>" + formatProductList(newItems);
    }
    return "No new drops tagged right now. Sign up for notifications to be first to know.";
  }

  // --- LIMITED ---
  if (lower.includes('limited') || lower.includes('exclusive') || lower.includes('rare')) {
    const limited = catalog.filter(p => p.badge === 'LIMITED');
    if (limited.length > 0) {
      return "Limited edition (won't restock):<br><br>" + formatProductList(limited);
    }
    return "No limited items currently available.";
  }

  // --- BEST SELLERS / POPULAR / RECOMMEND ---
  if (lower.includes('best') || lower.includes('popular') || lower.includes('recommend') || lower.includes('suggest') || lower.includes('favorite') || lower.includes('top') || lower.includes('pick')) {
    const picks = catalog.filter(p => p.badge === 'BEST SELLER' || p.badge === 'HOT');
    if (picks.length > 0) {
      return "Most popular right now:<br><br>" + formatProductList(picks);
    }
    return "No items tagged as best sellers currently. Here's the full lineup:<br><br>" + formatProductList(catalog.slice(0, 4));
  }

  // --- SIZING ---
  if (lower.includes('size') || lower.includes('sizing') || lower.includes('fit') || lower.includes('large') || lower.includes('small') || lower.includes('medium') || lower.includes('xl')) {
    return "Sizing info:<br><b>T-Shirts:</b> Slightly oversized. Size down for a fitted look.<br><b>Sweatshirts:</b> True to size, relaxed fit.<br><br>Sizes available: S, M, L, XL, XXL. All measurements are on each product page.";
  }

  // --- SHIPPING ---
  if (lower.includes('ship') || lower.includes('delivery') || lower.includes('deliver') || lower.includes('arrive')) {
    return "Shipping:<br>US: 3-5 business days (free over $75)<br>International: 7-14 business days<br>Express: next-day available at checkout";
  }

  // --- RETURNS ---
  if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
    return "Returns: 30-day window, unworn with tags. Exchanges are free. Refunds process in 3-5 business days.";
  }

  // --- MATERIALS ---
  if (lower.includes('material') || lower.includes('cotton') || lower.includes('fabric') || lower.includes('quality') || lower.includes('made of') || lower.includes('gsm')) {
    return "Materials:<br><b>T-Shirts:</b> 100% organic cotton, 220-280gsm, pre-shrunk<br><b>Sweatshirts:</b> 400gsm fleece, garment-dyed, brushed interior";
  }

  // --- ORDER / TRACK ---
  if (lower.includes('order') || lower.includes('track') || lower.includes('where is my') || lower.includes('status')) {
    return "Check your confirmation email for a tracking link. Order status is also in your account if you're logged in.";
  }

  // --- PAYMENT ---
  if (lower.includes('pay') || lower.includes('visa') || lower.includes('card') || lower.includes('paypal') || lower.includes('apple pay')) {
    return "Accepted payments: Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay. All transactions use 256-bit encryption.";
  }

  // --- GREETING ---
  if (lower.includes('hey') || lower.includes('hi') || lower.includes('hello') || lower.includes('yo') || lower.includes('sup') || lower.includes('what up') || lower.includes("what's up")) {
    return `Hey! We currently have <b>${catalog.length} items</b> in the store — ${tees.length} tees and ${sweats.length} sweatshirts. What can I help you find?`;
  }

  // --- THANKS ---
  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('thx') || lower.includes('appreciate')) {
    return "You're welcome. Let me know if you need anything else.";
  }

  // --- HELP ---
  if (lower.includes('help') || lower.includes('what can you do') || lower.includes('how do')) {
    return "I can look up:<br>• Any product by name (exact prices & details)<br>• Full catalog or by category<br>• Items by budget (try 'under $60')<br>• What's new, limited, or on sale<br>• Sizing, shipping, returns, payment info<br>• Discount codes";
  }

  // --- ABOUT ---
  if (lower.includes('about') || lower.includes('who are you') || lower.includes('what is drippy') || lower.includes('legit')) {
    return "DRIPPY is a premium streetwear brand. We design and sell high-quality tees and sweatshirts. How can I help you today?";
  }

  // --- DEFAULT (no match — stay factual) ---
  return `I have info on ${catalog.length} products (${tees.length} tees, ${sweats.length} sweatshirts). Try asking about a specific product, pricing, what's new, or type "show me all" to see everything.`;
}

// ===== NEWSLETTER / NOTIFICATIONS =====
function updateNewsletterState() {
  const locked = document.getElementById('newsletterLocked');
  const form = document.getElementById('newsletterForm');
  const done = document.getElementById('newsletterDone');
  const icon = document.getElementById('bannerIcon');
  const desc = document.getElementById('bannerDesc');

  // Guard: if newsletter elements don't exist on this page, skip
  if (!locked && !form && !done) return;

  if (!currentUser) {
    if (locked) locked.style.display = 'flex';
    if (form) form.style.display = 'none';
    if (done) done.style.display = 'none';
    return;
  }

  const alreadySubscribed = subscriberDB.some(
    sub => sub.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  if (alreadySubscribed) {
    if (locked) locked.style.display = 'none';
    if (form) form.style.display = 'none';
    if (done) done.style.display = 'flex';
    if (icon) { icon.className = 'fas fa-check-circle banner-icon'; icon.style.color = '#22c55e'; }
    if (desc) desc.textContent = "You're all set! We'll hit you up when new lines drop.";
  } else {
    if (locked) locked.style.display = 'none';
    if (form) form.style.display = 'block';
    if (done) done.style.display = 'none';
    const emailInput = document.getElementById('newsletterEmail');
    if (emailInput) emailInput.value = currentUser.email;
  }
}

function subscribeNewsletter() {
  if (!currentUser) {
    showToast('Please log in first');
    showPage('login');
    return;
  }

  const emailEl = document.getElementById('newsletterEmail');
  const phoneEl = document.getElementById('newsletterPhone');
  if (!emailEl) return;
  const email = emailEl.value.trim();
  const phone = phoneEl ? phoneEl.value.trim() : '';

  if (!email) return showToast('Enter your email');

  // Check if email already in database
  const exists = subscriberDB.some(
    sub => sub.email.toLowerCase() === email.toLowerCase()
  );
  if (exists) {
    showToast('This email is already subscribed!');
    updateNewsletterState();
    return;
  }

  // Save to subscriber database
  subscriberDB.push({
    email: email,
    phone: phone || null,
    name: currentUser.name,
    date: new Date().toISOString()
  });
  localStorage.setItem('drippy_subscribers', JSON.stringify(subscriberDB));

  showToast("You're on the list! We'll notify you on new drops.");
  updateNewsletterState();
}

// ===== TOAST =====
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== CUSTOM DESIGNER =====
const designerFonts = [
  { name: 'Bold', family: "'Inter', sans-serif", weight: '900', style: 'normal' },
  { name: 'Classic', family: "'Georgia', serif", weight: '700', style: 'normal' },
  { name: 'Script', family: "'Brush Script MT', cursive", weight: '400', style: 'normal' },
  { name: 'Mono', family: "'Courier New', monospace", weight: '700', style: 'normal' },
  { name: 'Italic', family: "'Inter', sans-serif", weight: '700', style: 'italic' },
  { name: 'Thin', family: "'Inter', sans-serif", weight: '300', style: 'normal' },
  { name: 'Impact', family: "'Impact', sans-serif", weight: '400', style: 'normal' },
  { name: 'Retro', family: "'Trebuchet MS', sans-serif", weight: '700', style: 'normal' },
];

const textColors = [
  '#1a1a1a'
];

const shirtColors = [
  { name: 'White', color: '#f0f0f0' },
];

const designerGraphics = [
  { name: 'None', symbol: '✕' },
  { name: 'Star', symbol: '★' },
  { name: 'Cross', symbol: '✟' },
  { name: 'Lightning', symbol: '⚡' },
  { name: 'Fire', symbol: '🔥' },
  { name: 'Heart', symbol: '♥' },
  { name: 'Crown', symbol: '♛' },
  { name: 'Rose', symbol: '✿' },
  { name: 'Eye', symbol: '◉' },
  { name: 'Diamond', symbol: '◆' },
  { name: 'Chain', symbol: '⛓' },
  { name: 'Sword', symbol: '⚔' },
  { name: 'Moon', symbol: '☽' },
];

const designerState = {
  tee: { text: 'DRIPPY', font: 0, color: '#1a1a1a', size: 28, shirtColor: '#f0f0f0', graphic: 0 },
  sweat: { text: 'DRIPPY', font: 0, color: '#1a1a1a', size: 28, shirtColor: '#f0f0f0', graphic: 0 },
};

function initDesigner(type) {
  const fontGrid = document.getElementById(type + 'Fonts');
  const colorGrid = document.getElementById(type + 'Colors');
  const shirtColorGrid = document.getElementById(type + 'ShirtColors');
  const graphicGrid = document.getElementById(type + 'Graphics');

  // Populate size selector and price from server settings
  const sizeSelect = document.getElementById(type + 'ClothingSize');
  if (sizeSelect) {
    const sizes = getCustomSizes(type);
    sizeSelect.innerHTML = sizes.map((s, i) => `<option value="${s}"${i === 0 ? ' selected' : ''}>${s}</option>`).join('');
  }
  const priceEl = document.getElementById(type + 'CustomPriceValue');
  if (priceEl) priceEl.textContent = '$' + getCustomPrice(type);

  graphicGrid.innerHTML = designerGraphics.map((g, i) => `
    <div class="graphic-option ${i === 0 ? 'active' : ''}" onclick="selectGraphic('${type}', ${i}, this)"
      title="${g.name}">${g.symbol}</div>
  `).join('');

  fontGrid.innerHTML = designerFonts.map((f, i) => `
    <div class="font-option ${i === 0 ? 'active' : ''}" style="font-family:${f.family};font-weight:${f.weight};font-style:${f.style};"
      onclick="selectFont('${type}', ${i}, this)">${f.name}</div>
  `).join('');

  colorGrid.innerHTML = textColors.map((c, i) => `
    <div class="color-swatch ${i === 0 ? 'active' : ''}" style="background:${c};${c === '#ffffff' ? 'border:1px solid #ddd;' : ''}"
      onclick="selectTextColor('${type}', '${c}', this)"></div>
  `).join('');

  shirtColorGrid.innerHTML = shirtColors.map((s, i) => `
    <div class="shirt-color-swatch ${i === 0 ? 'active' : ''}" style="background:${s.color};"
      title="${s.name}" onclick="selectShirtColor('${type}', '${s.color}', this)"></div>
  `).join('');

  // Apply uploaded template image if available
  const templateKey = type === 'tee' ? 'tshirt' : 'sweatshirt';
  const template = _s['custom_template_' + templateKey];
  if (template) {
    const previewShirt = document.getElementById(type + 'Preview');
    if (previewShirt) {
      const outlineEl = previewShirt.querySelector('.shirt-outline');
      if (outlineEl) {
        outlineEl.innerHTML = '<img src="' + template + '" style="width:100%;height:auto;display:block;filter:drop-shadow(0 4px 20px rgba(0,0,0,0.08));">';
      }
    }
  }
}

function selectGraphic(type, index, el) {
  designerState[type].graphic = index;
  el.closest('.graphic-grid').querySelectorAll('.graphic-option').forEach(g => g.classList.remove('active'));
  el.classList.add('active');
  updatePreview(type);
}

function selectFont(type, index, el) {
  designerState[type].font = index;
  el.closest('.font-grid').querySelectorAll('.font-option').forEach(f => f.classList.remove('active'));
  el.classList.add('active');
  updatePreview(type);
}

function selectTextColor(type, color, el) {
  designerState[type].color = color;
  el.closest('.color-grid').querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  updatePreview(type);
}

function selectShirtColor(type, color, el) {
  designerState[type].shirtColor = color;
  el.closest('.shirt-color-grid').querySelectorAll('.shirt-color-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  updatePreview(type);
}

function updatePreview(type) {
  const state = designerState[type];
  const textInput = document.getElementById(type + 'Text');
  const sizeInput = document.getElementById(type + 'Size');
  const previewText = document.getElementById(type + 'PreviewText');

  if (textInput.value) state.text = textInput.value;
  state.size = parseInt(sizeInput.value);

  const font = designerFonts[state.font];
  previewText.textContent = state.text;
  previewText.style.fontFamily = font.family;
  previewText.style.fontWeight = font.weight;
  previewText.style.fontStyle = font.style;
  previewText.style.fontSize = state.size + 'px';
  previewText.style.color = state.color;

  // Update SVG fill (only if SVG is still present, not replaced by template)
  const svgId = type === 'tee' ? 'teeSvgFill' : 'sweatSvgFill';
  const svgPath = document.getElementById(svgId);
  if (svgPath) svgPath.setAttribute('fill', state.shirtColor);
  // If using uploaded template, apply tint overlay
  const templateKey = type === 'tee' ? 'tshirt' : 'sweatshirt';
  const hasTemplate = _s['custom_template_' + templateKey];
  if (hasTemplate) {
    const previewShirt = document.getElementById(type + 'Preview');
    if (previewShirt) {
      const outlineEl = previewShirt.querySelector('.shirt-outline');
      if (outlineEl) outlineEl.style.filter = 'drop-shadow(0 4px 20px rgba(0,0,0,0.08))';
    }
  }

  // Update graphic
  const graphicEl = document.getElementById(type + 'PreviewGraphic');
  if (state.graphic > 0) {
    graphicEl.textContent = designerGraphics[state.graphic].symbol;
    graphicEl.classList.add('visible');
  } else {
    graphicEl.textContent = '';
    graphicEl.classList.remove('visible');
  }
}

function capturePreviewImage(type) {
  const previewEl = document.getElementById(type + 'Preview');
  if (!previewEl) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = type === 'tee' ? 450 : 460;
    const ctx = canvas.getContext('2d');
    const state = designerState[type];
    const font = designerFonts[state.font];

    // Check for uploaded template image
    const templateKey = type === 'tee' ? 'tshirt' : 'sweatshirt';
    const templateImg = _s['custom_template_' + templateKey];

    if (templateImg) {
      // Draw uploaded template image
      return new Promise(resolve => {
        const img = new Image();
        img.onload = function() {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          drawTextAndGraphic(ctx, state, font, type, canvas);
          resolve(canvas.toDataURL('image/png', 0.7));
        };
        img.onerror = function() {
          drawSVGShirt(ctx, state, type, canvas);
          drawTextAndGraphic(ctx, state, font, type, canvas);
          resolve(canvas.toDataURL('image/png', 0.7));
        };
        img.src = templateImg;
      });
    } else {
      drawSVGShirt(ctx, state, type, canvas);
      drawTextAndGraphic(ctx, state, font, type, canvas);
      return Promise.resolve(canvas.toDataURL('image/png', 0.7));
    }
  } catch(e) {
    return Promise.resolve(null);
  }
}

function drawSVGShirt(ctx, state, type, canvas) {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = state.shirtColor;
  ctx.beginPath();
  if (type === 'tee') {
    // Simplified t-shirt shape
    ctx.moveTo(100,0); ctx.lineTo(160,0); ctx.quadraticCurveTo(180,50,200,50);
    ctx.quadraticCurveTo(220,50,240,0); ctx.lineTo(300,0); ctx.lineTo(400,80);
    ctx.lineTo(350,130); ctx.lineTo(300,95); ctx.lineTo(300,440);
    ctx.quadraticCurveTo(300,450,290,450); ctx.lineTo(110,450);
    ctx.quadraticCurveTo(100,450,100,440); ctx.lineTo(100,95);
    ctx.lineTo(50,130); ctx.lineTo(0,80); ctx.closePath();
  } else {
    // Simplified sweatshirt shape
    ctx.moveTo(95,0); ctx.lineTo(155,0); ctx.quadraticCurveTo(178,45,200,45);
    ctx.quadraticCurveTo(222,45,245,0); ctx.lineTo(305,0); ctx.lineTo(400,75);
    ctx.lineTo(355,130); ctx.lineTo(305,100); ctx.lineTo(305,450);
    ctx.quadraticCurveTo(305,460,295,460); ctx.lineTo(105,460);
    ctx.quadraticCurveTo(95,460,95,450); ctx.lineTo(95,100);
    ctx.lineTo(45,130); ctx.lineTo(0,75); ctx.closePath();
  }
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTextAndGraphic(ctx, state, font, type, canvas) {
  // Draw graphic
  if (state.graphic > 0) {
    const graphic = designerGraphics[state.graphic];
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = state.color;
    const gy = type === 'tee' ? 140 : 145;
    ctx.fillText(graphic.symbol, canvas.width / 2, gy);
  }

  // Draw text
  if (state.text) {
    const fontStr = font.style + ' ' + font.weight + ' ' + state.size + 'px ' + font.family;
    ctx.font = fontStr;
    ctx.textAlign = 'center';
    ctx.fillStyle = state.color;
    const ty = type === 'tee' ? 250 : 260;
    ctx.fillText(state.text, canvas.width / 2, ty, canvas.width * 0.6);
  }
}

function addCustomToCart(type) {
  const state = designerState[type];
  const font = designerFonts[state.font];
  const label = type === 'tee' ? 'T-Shirt' : 'Sweatshirt';
  const price = getCustomPrice(type);
  const selectedSize = document.getElementById(type + 'ClothingSize');
  const clothingSize = selectedSize ? selectedSize.value : '';
  const id = 'custom-' + type + '-' + Date.now();

  // Capture preview image then store
  capturePreviewImage(type).then(previewImage => {
    if (!Array.isArray(_s.custom_orders)) _s.custom_orders = [];
    const graphic = designerGraphics[state.graphic];
    _s.custom_orders.push({
      id: id,
      type: label,
      text: state.text,
      font: font.name,
      color: state.color,
      size: state.size,
      shirtColor: state.shirtColor,
      graphic: graphic.name,
      graphicSymbol: state.graphic > 0 ? graphic.symbol : null,
      price: price,
      clothingSize: clothingSize,
      previewImage: previewImage || null
    });
    saveServerSettings();

    // Add to cart
    cart.push({ id: id, qty: 1, custom: true });
    saveCart();
    updateCartCount();
    showToast('Custom ' + label + ' added to bag!');
  });
}

// Override findProduct to handle custom items
const _origFindProduct = findProduct;
findProduct = function(id) {
  if (typeof id === 'string' && id.startsWith('custom-')) {
    const customOrders = Array.isArray(_s.custom_orders) ? _s.custom_orders : [];
    const order = customOrders.find(o => o.id === id);
    if (order) {
      return {
        id: order.id,
        name: 'Custom ' + order.type + ': "' + order.text + '"',
        desc: order.font + ' font, ' + order.type,
        price: order.price,
        emoji: order.type === 'T-Shirt' ? '👕' : '🧥',
        badge: 'CUSTOM',
        colors: []
      };
    }
    return null;
  }
  return _origFindProduct(id);
};

// Override getPrice/getName for custom items
const _origGetPrice = getPrice;
getPrice = function(product) {
  if (typeof product.id === 'string' && product.id.startsWith('custom-')) return product.price;
  return _origGetPrice(product);
};
const _origGetName = getName;
getName = function(product) {
  if (typeof product.id === 'string' && product.id.startsWith('custom-')) return product.name;
  return _origGetName(product);
};

// Init designers when pages are shown
const _origShowPage = showPage;
showPage = function(pageId) {
  _origShowPage(pageId);
  if (pageId === 'custom-tee') initDesigner('tee');
  if (pageId === 'custom-sweat') initDesigner('sweat');
};

// ===== ADMIN PANEL (integrated) =====
const ADMIN_PASS = '123';
let adminUploadCategory = 'tshirts';
let adminGalleryFilter = 'all';
let adminPriceTab = 'tshirts';
let adminPhotos = [];
let adminEmailAddr = '';
let adminPriceOverrides = {};
let adminNameOverrides = {};
let adminBadgeOverrides = {};
let productPhotos = {};

// Product data for admin (mirrors main products)
const adminProductData = {
  tshirts: products.tshirts.slice(),
  sweatshirts: products.sweatshirts.slice()
};

function adminAuth() {
  const pass = document.getElementById('adminPass').value;
  if (pass === ADMIN_PASS) {
    document.getElementById('adminLoginGate').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    // Sync admin vars from server settings
    loadServerSettings().then(() => {
      adminPriceOverrides = _s.prices || {};
      adminNameOverrides = _s.names || {};
      adminBadgeOverrides = _s.badges || {};
      adminEmailAddr = _s.admin_email || '';
      document.getElementById('adminEmail').value = adminEmailAddr;
      updateAdminStats();
      renderAdminSubscribers();
      renderAdminPriceList();
      renderAdminOrders();
      renderAdminCustomOrders();
      renderAdminPhotoGrids();
      loadCustomSettingsUI();
    });
  } else {
    document.getElementById('adminLoginError').style.display = 'block';
    document.getElementById('adminPass').value = '';
    document.getElementById('adminPass').focus();
  }
}

function saveAdminEmail() {
  const email = document.getElementById('adminEmail').value.trim();
  if (!email) return showToast('Enter an email');
  adminEmailAddr = email;
  _s.admin_email = email;
  saveServerSettings();
  showToast('Notification email saved: ' + email);
}

// --- Add Product ---
function addNewProduct() {
  const cat = document.getElementById('newProductCat').value;
  const name = document.getElementById('newProductName').value.trim();
  const price = parseInt(document.getElementById('newProductPrice').value);
  const desc = document.getElementById('newProductDesc').value.trim();
  const emoji = document.getElementById('newProductEmoji').value.trim() || '🏷️';
  const colorsRaw = document.getElementById('newProductColors').value.trim();
  const badge = document.getElementById('newProductBadge').value || null;

  if (!name) return showToast('Enter a product name');
  if (!price || price < 1) return showToast('Enter a valid price');
  if (!desc) return showToast('Enter a description');

  const colors = colorsRaw ? colorsRaw.split(',').map(c => c.trim()).filter(Boolean) : ['Black', 'White'];
  const id = Date.now();
  const newProduct = { id, name, price, desc, emoji, badge, colors, category: cat };

  _s.custom_products.push(newProduct);
  saveServerSettings();

  if (cat === 'tshirts') { products.tshirts.push(newProduct); adminProductData.tshirts.push(newProduct); }
  else { products.sweatshirts.push(newProduct); adminProductData.sweatshirts.push(newProduct); }

  document.getElementById('newProductName').value = '';
  document.getElementById('newProductPrice').value = '';
  document.getElementById('newProductDesc').value = '';
  document.getElementById('newProductEmoji').value = '';
  document.getElementById('newProductColors').value = '';
  document.getElementById('newProductBadge').value = '';

  renderAdminPriceList();
  updateAdminStats();
  refreshStorefront();
  showToast(name + ' added to ' + (cat === 'tshirts' ? 'T-Shirts' : 'Sweatshirts') + '!');
}

// --- Price/Name/Badge Editor ---
function showPriceTab(tab, btn) {
  adminPriceTab = tab;
  btn.closest('.admin-tabs').querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderAdminPriceList();
}

function renderAdminPriceList() {
  const list = document.getElementById('priceList');
  const deletedIds = _s.deleted || [];
  const items = adminProductData[adminPriceTab].filter(p => !deletedIds.includes(p.id));

  if (items.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:2rem;color:#444;">No products in this category.</div>';
    return;
  }

  const sizeOverrides = _s.sizes || {};
  const colorOverrides = _s.colors || {};
  const badgeOptions = ['', 'NEW', 'HOT', 'SALE', 'LIMITED', 'BEST SELLER'];
  list.innerHTML = items.map(p => {
    const currentPrice = adminPriceOverrides[p.id] !== undefined ? adminPriceOverrides[p.id] : p.price;
    const currentName = adminNameOverrides[p.id] !== undefined ? adminNameOverrides[p.id] : p.name;
    const currentBadge = adminBadgeOverrides[p.id] !== undefined ? adminBadgeOverrides[p.id] : (p.badge || '');
    const hasPhoto = productPhotos[p.id];
    const currentSizes = sizeOverrides[p.id] || (p.sizes || ['S','M','L','XL','XXL']).join(', ');
    const currentColors = colorOverrides[p.id] || (p.colors || ['Black','White']).join(', ');
    return `
      <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:1rem;border:1px solid rgba(255,255,255,0.04);margin-bottom:0.25rem;">
        <!-- Row 1: Photo, Name, Price, Badge, Delete -->
        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
          <div class="product-photo-box" onclick="document.getElementById('photoInput-${p.id}').click()" title="Click to upload photo">
            ${hasPhoto
              ? `<img src="${hasPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
              : `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#555;font-size:0.65rem;"><i class="fas fa-camera" style="font-size:1rem;margin-bottom:2px;color:#7c3aed;"></i>Photo</div>`
            }
            <input type="file" id="photoInput-${p.id}" accept="image/*" style="display:none;" onchange="uploadProductPhoto(${p.id}, this)">
          </div>
          <input type="text" value="${sanitizeHTML(currentName)}" data-name-id="${p.id}" class="admin-input" style="flex:1;font-weight:600;min-width:120px;">
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="color:#7c3aed;font-weight:700;">$</span>
            <input type="number" min="1" step="1" value="${currentPrice}" data-id="${p.id}" class="admin-input" style="width:80px;text-align:center;">
          </div>
          <select data-badge-id="${p.id}" class="admin-select" style="min-width:110px;padding:10px 12px;">
            ${badgeOptions.map(b => `<option value="${b}" ${b === currentBadge ? 'selected' : ''}>${b || 'No Badge'}</option>`).join('')}
          </select>
          ${hasPhoto ? `<button onclick="removeProductPhoto(${p.id})" title="Remove photo" style="width:36px;height:36px;border-radius:10px;border:none;background:rgba(255,165,0,0.1);color:#f59e0b;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.85rem;" onmouseover="this.style.background='#f59e0b';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,165,0,0.1)';this.style.color='#f59e0b'"><i class="fas fa-times"></i></button>` : ''}
          <button onclick="deleteProduct(${p.id}, '${sanitizeHTML(currentName).replace(/'/g, "\\'")}')" title="Delete product"
            style="width:36px;height:36px;border-radius:10px;border:none;background:rgba(239,68,68,0.1);color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.85rem;"
            onmouseover="this.style.background='#ef4444';this.style.color='#fff'" onmouseout="this.style.background='rgba(239,68,68,0.1)';this.style.color='#ef4444'">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <!-- Row 2: Sizes & Colors -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.6rem;">
          <div>
            <label style="font-size:0.7rem;color:#666;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Sizes</label>
            <input type="text" value="${sanitizeHTML(currentSizes)}" data-sizes-id="${p.id}" class="admin-input" style="font-size:0.85rem;padding:8px 12px;margin-top:2px;" placeholder="Youth S, Youth M, Youth L">
          </div>
          <div>
            <label style="font-size:0.7rem;color:#666;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Colors</label>
            <input type="text" value="${sanitizeHTML(currentColors)}" data-colors-id="${p.id}" class="admin-input" style="font-size:0.85rem;padding:8px 12px;margin-top:2px;" placeholder="White, Black">
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function uploadProductPhoto(productId, input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return showToast('Please select an image');
  if (file.size > 5 * 1024 * 1024) return showToast('Image must be under 5MB');

  const reader = new FileReader();
  reader.onload = function(e) {
    showToast('Uploading photo...');
    fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: productId, dataUrl: e.target.result })
    }).then(r => r.json()).then(data => {
      if (data.photosMap) { _productPhotos = data.photosMap; productPhotos = data.photosMap; }
      else { _productPhotos[productId] = data.url; productPhotos[productId] = data.url; }
      renderAdminPriceList();
      renderAdminPhotoGrids();
      refreshStorefront();
      showToast('Photo uploaded!');
    }).catch(() => showToast('Upload failed'));
  };
  reader.readAsDataURL(file);
}

function removeProductPhoto(productId) {
  fetch('/api/photos', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: productId })
  }).then(r => r.json()).then(data => {
    if (data.photosMap) { _productPhotos = data.photosMap; productPhotos = data.photosMap; }
    else { delete _productPhotos[productId]; delete productPhotos[productId]; }
    renderAdminPriceList();
    renderAdminPhotoGrids();
    refreshStorefront();
    showToast('Photo removed');
  }).catch(() => showToast('Failed to remove photo'));
}

function renderAdminPhotoGrids() {
  const deletedIds = _s.deleted || [];
  const teeGrid = document.getElementById('tshirtPhotoGrid');
  const sweatGrid = document.getElementById('sweatshirtPhotoGrid');
  if (!teeGrid || !sweatGrid) return;

  const tees = adminProductData.tshirts.filter(p => !deletedIds.includes(p.id));
  const sweats = adminProductData.sweatshirts.filter(p => !deletedIds.includes(p.id));

  teeGrid.innerHTML = renderPhotoCards(tees);
  sweatGrid.innerHTML = renderPhotoCards(sweats);

  // Load custom designer templates
  loadTemplatePreview('tshirt');
  loadTemplatePreview('sweatshirt');
}

// ===== CUSTOM DESIGNER TEMPLATES =====
function uploadCustomTemplate(type, input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Image too large (max 5MB)'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    _s['custom_template_' + type] = e.target.result;
    saveServerSettings();
    loadTemplatePreview(type);
    applyDesignerTemplate(type);
    showToast((type === 'tshirt' ? 'T-Shirt' : 'Sweatshirt') + ' template updated!');
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function removeCustomTemplate(type) {
  delete _s['custom_template_' + type];
  saveServerSettings();
  loadTemplatePreview(type);
  applyDesignerTemplate(type);
  showToast((type === 'tshirt' ? 'T-Shirt' : 'Sweatshirt') + ' template removed');
}

function loadTemplatePreview(type) {
  const previewEl = document.getElementById((type === 'tshirt' ? 'tee' : 'sweat') + 'TemplatePreview');
  const placeholderEl = document.getElementById((type === 'tshirt' ? 'tee' : 'sweat') + 'TemplatePlaceholder');
  const removeBtn = document.getElementById((type === 'tshirt' ? 'tee' : 'sweat') + 'TemplateRemoveBtn');
  if (!previewEl) return;

  const template = _s['custom_template_' + type];
  if (template) {
    previewEl.innerHTML = '<img src="' + template + '" style="width:100%;height:100%;object-fit:contain;">';
    previewEl.style.borderStyle = 'solid';
    if (removeBtn) removeBtn.disabled = false;
  } else {
    const icon = type === 'tshirt' ? 'fa-tshirt' : 'fa-mitten';
    previewEl.innerHTML = '<div style="color:#444;font-size:0.85rem;"><i class="fas ' + icon + '" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Click to upload</div>';
    previewEl.style.borderStyle = 'dashed';
    if (removeBtn) removeBtn.disabled = true;
  }
}

function applyDesignerTemplate(type) {
  // Update the live designer preview if it exists on the page
  const designerType = type === 'tshirt' ? 'tee' : 'sweat';
  const previewShirt = document.getElementById(designerType + 'Preview');
  if (!previewShirt) return;

  const template = _s['custom_template_' + type];
  const outlineEl = previewShirt.querySelector('.shirt-outline');
  if (!outlineEl) return;

  if (template) {
    outlineEl.innerHTML = '<img src="' + template + '" style="width:100%;height:auto;display:block;filter:drop-shadow(0 4px 20px rgba(0,0,0,0.08));">';
  } else {
    // Restore original SVG — reload page to restore (or re-insert)
    location.reload();
  }
}

function renderPhotoCards(items) {
  return items.map(p => {
    const photo = productPhotos[p.id];
    const name = adminNameOverrides[p.id] || p.name;
    return `
      <div class="admin-photo-card">
        <div class="admin-photo-card-img" onclick="document.getElementById('gridPhoto-${p.id}').click()">
          ${photo
            ? `<img src="${photo}" alt="${sanitizeHTML(name)}">`
            : `<div class="photo-placeholder"><i class="fas fa-camera"></i>Click to upload</div>`
          }
          <input type="file" id="gridPhoto-${p.id}" accept="image/*" style="display:none;" onchange="uploadProductPhoto(${p.id}, this)">
        </div>
        <div class="admin-photo-card-info">
          <div class="photo-card-name">${sanitizeHTML(name)}</div>
          <div class="photo-card-actions">
            <button class="photo-btn-upload" onclick="document.getElementById('gridPhoto-${p.id}').click()">
              <i class="fas fa-upload"></i> ${photo ? 'Change' : 'Upload'}
            </button>
            ${photo ? `<button class="photo-btn-remove" onclick="removeProductPhoto(${p.id})"><i class="fas fa-trash"></i> Remove</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function savePrices() {
  document.querySelectorAll('#priceList input[type="number"]').forEach(input => {
    const id = parseInt(input.dataset.id);
    const val = parseInt(input.value);
    if (!isNaN(val) && val > 0) adminPriceOverrides[id] = val;
  });
  document.querySelectorAll('#priceList input[data-name-id]').forEach(input => {
    const id = parseInt(input.dataset.nameId);
    const val = input.value.trim();
    if (val) adminNameOverrides[id] = val;
  });
  document.querySelectorAll('#priceList select[data-badge-id]').forEach(select => {
    const id = parseInt(select.dataset.badgeId);
    adminBadgeOverrides[id] = select.value;
  });
  // Save sizes
  document.querySelectorAll('#priceList input[data-sizes-id]').forEach(input => {
    const id = parseInt(input.dataset.sizesId);
    const val = input.value.trim();
    if (val) _s.sizes[id] = val;
  });

  // Save colors
  document.querySelectorAll('#priceList input[data-colors-id]').forEach(input => {
    const id = parseInt(input.dataset.colorsId);
    const val = input.value.trim();
    if (val) _s.colors[id] = val;
  });

  _s.prices = adminPriceOverrides;
  _s.names = adminNameOverrides;
  _s.badges = adminBadgeOverrides;
  saveServerSettings();
  refreshStorefront();
  showToast('Changes saved! Live on the store now.');
}

function deleteProduct(id, name) {
  if (!confirm('Delete "' + name + '"? This removes it from the storefront.')) return;
  if (!_s.deleted.includes(id)) {
    _s.deleted.push(id);
    saveServerSettings();
  }
  renderAdminPriceList();
  refreshStorefront();
  showToast(name + ' deleted from store.');
}

// --- Upload Photos ---
function initAdminDropZone() {
  // Photo uploads now handled per-product in photo grids
}

// --- Gallery ---
function filterGallery(filter, btn) {
  adminGalleryFilter = filter;
  if (btn) {
    btn.closest('.admin-tabs').querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  renderAdminGallery();
}

function renderAdminGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const filtered = adminGalleryFilter === 'all' ? adminPhotos : adminPhotos.filter(p => p.category === adminGalleryFilter);
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="admin-gallery-empty"><i class="fas fa-image"></i><p>No photos in this category</p></div>';
    return;
  }
  grid.innerHTML = filtered.map(photo => `
    <div class="gallery-item">
      <img src="${photo.dataUrl}" alt="${sanitizeHTML(photo.name)}">
      <div class="gallery-overlay">
        <button class="btn-view" onclick="openAdminLightbox('${photo.dataUrl}')" title="View"><i class="fas fa-expand"></i></button>
        <button class="btn-delete" onclick="deleteAdminPhoto('${photo.id}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function deleteAdminPhoto(id) {
  adminPhotos = adminPhotos.filter(p => p.id !== id);
  updateAdminStats();
  renderAdminGallery();
  showToast('Photo deleted');
}

function openAdminLightbox(src) {
  document.getElementById('adminLightboxImg').src = src;
  document.getElementById('adminLightbox').classList.add('active');
}

function closeAdminLightbox() {
  document.getElementById('adminLightbox').classList.remove('active');
}

// --- Stats ---
function updateAdminStats() {
  const subs = subscriberDB;
  document.getElementById('statTotal').textContent = adminPhotos.length;
  document.getElementById('statTshirts').textContent = adminPhotos.filter(p => p.category === 'tshirts').length;
  document.getElementById('statSweatshirts').textContent = adminPhotos.filter(p => p.category === 'sweatshirts').length;
  document.getElementById('statSubs').textContent = subs.length;
}

// --- Custom Orders ---
function renderAdminOrders() {
  const orders = _s.orders || [];
  const list = document.getElementById('orderList');
  const count = document.getElementById('orderCount');
  if (!list) return;
  if (count) count.textContent = '(' + orders.length + ')';

  if (orders.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:2rem;color:#444;"><i class="fas fa-shopping-bag" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>No orders yet</div>';
    return;
  }

  // Show newest first
  const sorted = [...orders].reverse();
  list.innerHTML = '<div style="display:flex;flex-direction:column;gap:0.75rem;">' + sorted.map(o => `
    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:1rem;border:1px solid rgba(255,255,255,0.04);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <div style="font-weight:700;font-size:0.95rem;color:#fff;">${sanitizeHTML(o.customer)}</div>
          <div style="font-size:0.8rem;color:#555;">${sanitizeHTML(o.email)}</div>
          ${o.address && o.address.street ? `<div style="font-size:0.78rem;color:#888;margin-top:2px;"><i class="fas fa-map-marker-alt" style="color:#7c3aed;margin-right:3px;font-size:0.7rem;"></i>${sanitizeHTML(o.address.name ? o.address.name + ', ' : '')}${sanitizeHTML(o.address.street)}, ${sanitizeHTML(o.address.city)} ${sanitizeHTML(o.address.state)} ${sanitizeHTML(o.address.zip)}</div>` : ''}
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800;color:#7c3aed;font-size:1.1rem;">$${o.total.toFixed(2)}</div>
          <div style="font-size:0.75rem;color:#444;">${new Date(o.date).toLocaleDateString()} ${new Date(o.date).toLocaleTimeString()}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.35rem;">
        ${o.items.map(item => `
          <div style="display:flex;align-items:center;gap:0.75rem;background:rgba(255,255,255,0.04);border-radius:8px;padding:0.5rem 0.75rem;font-size:0.85rem;">
            ${item.previewImage ? `<img src="${item.previewImage}" alt="Preview" style="width:50px;height:auto;border-radius:6px;border:1px solid rgba(255,255,255,0.1);flex-shrink:0;cursor:pointer;" onclick="document.getElementById('adminLightboxImg').src=this.src;document.getElementById('adminLightbox').style.display='flex';">` : ''}
            <span style="flex:1;">${sanitizeHTML(item.name)}${item.size ? ' — ' + sanitizeHTML(item.size) : ''}${item.color ? ' / ' + sanitizeHTML(item.color) : ''} x${item.qty}</span>
            <span style="font-weight:600;">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;font-size:0.8rem;color:#666;">
        <span>${o.id}</span>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="color:${o.status === 'Pending' ? '#f59e0b' : '#22c55e'};font-weight:700;">${o.status}</span>
          ${o.status === 'Pending' ? `<button onclick="confirmOrderPayment('${o.id}')" style="padding:4px 12px;border-radius:6px;border:none;background:rgba(34,197,94,0.15);color:#22c55e;font-weight:700;font-size:0.75rem;cursor:pointer;font-family:inherit;">Confirm Paid</button>` : ''}
        </div>
      </div>
    </div>
  `).join('') + '</div>';
}

function confirmOrderPayment(orderId) {
  const orders = _s.orders || [];
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'Paid';
    saveServerSettings();
    renderAdminOrders();
    showToast('Order ' + orderId + ' marked as paid!');
  }
}

function renderAdminCustomOrders() {
  const orders = _s.purchased_custom || [];
  const list = document.getElementById('customOrderList');
  document.getElementById('customOrderCount').textContent = '(' + orders.length + ')';
  if (orders.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:2rem;color:#444;"><i class="fas fa-paint-brush" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>No custom orders yet</div>';
    return;
  }
  list.innerHTML = '<div style="display:flex;flex-direction:column;gap:0.75rem;">' + orders.map(o => `
    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:1rem;border:1px solid rgba(255,255,255,0.04);">
      <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:0.75rem;">
        ${o.previewImage ? `<img src="${o.previewImage}" alt="Custom ${sanitizeHTML(o.type)} Preview" style="width:100px;height:auto;border-radius:10px;border:1px solid rgba(255,255,255,0.1);flex-shrink:0;cursor:pointer;" onclick="document.getElementById('adminLightboxImg').src=this.src;document.getElementById('adminLightbox').style.display='flex';">` : `<span style="font-size:1.5rem;">${o.type === 'T-Shirt' ? '👕' : '🧥'}</span>`}
        <div style="flex:1;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
            <div>
              <div style="font-weight:700;font-size:0.95rem;">Custom ${sanitizeHTML(o.type)}</div>
              <div style="font-size:0.8rem;color:#555;">${sanitizeHTML(o.buyer)} (${sanitizeHTML(o.buyerEmail)})</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:800;color:#7c3aed;">$${o.price} x${o.qty}</div>
              <div style="font-size:0.75rem;color:#444;">${new Date(o.date).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.85rem;">
        <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:0.5rem 0.75rem;">
          <span style="color:#555;">Text:</span> <strong>"${sanitizeHTML(o.text)}"</strong>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:0.5rem 0.75rem;">
          <span style="color:#555;">Font:</span> <strong>${sanitizeHTML(o.font)}</strong>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:0.5rem 0.75rem;">
          <span style="color:#555;">Text Size:</span> <strong>${o.size}px</strong>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:0.5rem 0.75rem;">
          <span style="color:#555;">Text Color:</span> <span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${o.color};vertical-align:middle;border:1px solid rgba(255,255,255,0.2);"></span> <strong>${o.color}</strong>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:0.5rem 0.75rem;">
          <span style="color:#555;">Graphic:</span> <strong>${o.graphicSymbol ? o.graphicSymbol + ' ' + sanitizeHTML(o.graphic) : 'None'}</strong>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:0.5rem 0.75rem;grid-column:1/-1;">
          <span style="color:#555;">Shirt Color:</span> <span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${o.shirtColor};vertical-align:middle;border:1px solid rgba(255,255,255,0.2);"></span> <strong>${o.shirtColor}</strong>
        </div>
      </div>
    </div>
  `).join('') + '</div>';
}

// --- Subscribers ---
function renderAdminSubscribers() {
  const subs = subscriberDB;
  const list = document.getElementById('subscriberList');
  document.getElementById('subCount').textContent = '(' + subs.length + ')';
  if (subs.length === 0) {
    list.innerHTML = '<div class="admin-gallery-empty"><i class="fas fa-bell-slash"></i><p>No subscribers yet</p></div>';
    return;
  }
  list.innerHTML = '<div style="display:flex;flex-direction:column;gap:0.5rem;">' + subs.map(sub => `
    <div style="display:flex;align-items:center;gap:1rem;background:rgba(255,255,255,0.03);border-radius:12px;padding:0.75rem 1rem;border:1px solid rgba(255,255,255,0.04);">
      <div style="width:36px;height:36px;border-radius:10px;background:rgba(124,58,237,0.12);color:#7c3aed;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-user"></i></div>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:0.9rem;">${sanitizeHTML(sub.name || 'Unknown')}</div>
        <div style="font-size:0.8rem;color:#555;">${sanitizeHTML(sub.email)}${sub.phone ? ' &middot; ' + sanitizeHTML(sub.phone) : ''}</div>
      </div>
      <div style="font-size:0.75rem;color:#444;">${new Date(sub.date).toLocaleDateString()}</div>
    </div>
  `).join('') + '</div>';
}

