const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', cors(), express.static(uploadsDir));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ─── Persistence helpers ───────────────────────────────────────────────────────
function loadData(filename, defaultVal) {
  const file = path.join(dataDir, filename);
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {}
  return defaultVal;
}
function saveData(filename, data) {
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2));
}

// ─── Core Store ───────────────────────────────────────────────────────────────
const DEFAULT_PHOTOGRAPHERS = [
  {
    id: 'photographer_1',
    name: 'Rudimax Studio',
    contactPerson: 'Rudi Max',
    email: 'studio@rudimax.com',
    password: '123456',
    phone: '9876543211',
    rating: 4.8,
    totalBookings: 120,
    specializations: ['Traditional', 'Wedding', 'Corporate', 'Sports'],
    categories: ['Traditional', 'Wedding', 'Corporate', 'Sports'],
    bio: 'Professional photography & videography studio with 10+ years of experience.',
    about: 'Professional photography & videography studio with 10+ years of experience.',
    imageUrl: null,
    services: [],
    addons: [],
    portfolioPhotos: [],
    portfolioVideos: [],
    active: true,
    banned: false,
    banReason: null,
    passwordSet: true,
    joinedAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'photographer_2',
    name: 'Lens & Light Co.',
    contactPerson: '',
    email: 'lens@example.com',
    password: '123456',
    phone: '9876500001',
    rating: 4.5,
    totalBookings: 64,
    specializations: ['Events', 'Couple Shoot', 'Product'],
    categories: ['Events', 'Couple Shoot', 'Product'],
    bio: 'Capturing emotions one frame at a time.',
    about: 'Capturing emotions one frame at a time.',
    imageUrl: null,
    services: [],
    addons: [],
    portfolioPhotos: [],
    portfolioVideos: [],
    active: true,
    banned: false,
    banReason: null,
    passwordSet: true,
    joinedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'photographer_3',
    name: 'Pixel Perfect',
    contactPerson: '',
    email: 'pixel@example.com',
    password: '123456',
    phone: '9876500002',
    rating: 4.2,
    totalBookings: 32,
    specializations: ['Sports', 'Corporate'],
    categories: ['Sports', 'Corporate'],
    bio: 'Precision photography for sports and business.',
    about: 'Precision photography for sports and business.',
    imageUrl: null,
    services: [],
    addons: [],
    portfolioPhotos: [],
    portfolioVideos: [],
    active: false,
    banned: false,
    banReason: null,
    passwordSet: true,
    joinedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
  },
];

const store = {
  customers:     loadData('customers.json',     []),
  photographers: loadData('photographers.json', DEFAULT_PHOTOGRAPHERS),
  bookings:      loadData('bookings.json',      []),
};

// Migrate existing photographers that may lack new fields
store.photographers.forEach(p => {
  if (p.contactPerson === undefined) p.contactPerson = '';
  if (p.categories === undefined) p.categories = p.specializations || [];
  if (p.about === undefined) p.about = p.bio || '';
  if (p.imageUrl === undefined) p.imageUrl = null;
  if (p.services === undefined) p.services = [];
  if (p.addons === undefined) p.addons = [];
  if (p.portfolioPhotos === undefined) p.portfolioPhotos = [];
  if (p.portfolioVideos === undefined) p.portfolioVideos = [];
  if (p.banned === undefined) p.banned = false;
  if (p.banReason === undefined) p.banReason = null;
  if (p.passwordSet === undefined) p.passwordSet = true;
});

// Migrate existing customers that may lack new fields
store.customers.forEach(c => {
  if (c.banned === undefined) c.banned = false;
  if (c.banReason === undefined) c.banReason = null;
});

// ─── Admin Store ──────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id: 'cat_1', name: 'Sports',       imageUrl: `${BASE_URL}/uploads/category_sports.jpg`,       active: true, createdAt: Date.now() - 300*24*60*60*1000 },
  { id: 'cat_2', name: 'Traditional',  imageUrl: `${BASE_URL}/uploads/category_traditional.jpg`,  active: true, createdAt: Date.now() - 300*24*60*60*1000 },
  { id: 'cat_3', name: 'Corporate',    imageUrl: `${BASE_URL}/uploads/category_corporate.jpg`,    active: true, createdAt: Date.now() - 300*24*60*60*1000 },
  { id: 'cat_4', name: 'Couple Shoot', imageUrl: `${BASE_URL}/uploads/category_couple_shoot.jpg`, active: true, createdAt: Date.now() - 300*24*60*60*1000 },
  { id: 'cat_5', name: 'Events',       imageUrl: `${BASE_URL}/uploads/category_events.jpg`,       active: true, createdAt: Date.now() - 300*24*60*60*1000 },
  { id: 'cat_6', name: 'Product',      imageUrl: `${BASE_URL}/uploads/category_product.jpg`,      active: true, createdAt: Date.now() - 300*24*60*60*1000 },
];
const DEFAULT_SUBCATEGORIES = [
  { id: 'sub_1',  categoryId: 'cat_1', name: 'Cricket',       active: true },
  { id: 'sub_2',  categoryId: 'cat_1', name: 'Football',      active: true },
  { id: 'sub_3',  categoryId: 'cat_1', name: 'Basketball',    active: true },
  { id: 'sub_4',  categoryId: 'cat_2', name: 'Wedding',       active: true },
  { id: 'sub_5',  categoryId: 'cat_2', name: 'Engagement',    active: true },
  { id: 'sub_6',  categoryId: 'cat_3', name: 'Conference',    active: true },
  { id: 'sub_7',  categoryId: 'cat_3', name: 'Team Building', active: true },
  { id: 'sub_8',  categoryId: 'cat_3', name: 'Annual Day',    active: true },
  { id: 'sub_9',  categoryId: 'cat_4', name: 'Pre-Wedding',   active: true },
  { id: 'sub_10', categoryId: 'cat_4', name: 'Post-Wedding',  active: true },
  { id: 'sub_11', categoryId: 'cat_5', name: 'Birthday',      active: true },
  { id: 'sub_12', categoryId: 'cat_5', name: 'Anniversary',   active: true },
  { id: 'sub_13', categoryId: 'cat_5', name: 'Baby Shower',   active: true },
  { id: 'sub_14', categoryId: 'cat_6', name: 'E-commerce',    active: true },
  { id: 'sub_15', categoryId: 'cat_6', name: 'Catalogue',     active: true },
];
const DEFAULT_SERVICES = [
  { id: 'svc_1', name: 'Photography',              active: true },
  { id: 'svc_2', name: 'Videography',              active: true },
  { id: 'svc_3', name: 'Photography + Videography', active: true },
  { id: 'svc_4', name: 'Live Streaming',            active: true },
];
const DEFAULT_ADDONS = [
  { id: 'add_1', name: 'Drone Shot',            active: true },
  { id: 'add_2', name: 'Same Day Edit',          active: true },
  { id: 'add_3', name: 'Photo Album (50 pages)', active: true },
  { id: 'add_4', name: 'Cinematography',         active: true },
  { id: 'add_5', name: 'Candid Photography',     active: true },
];
const DEFAULT_BANNERS = [];
const DEFAULT_COUPONS = [
  { id: 'cop_1', code: 'FIRST20',   discount: 20,  type: 'percent', minOrder: 5000,  maxUses: 100, usedCount: 45, expiry: '2026-12-31', active: true, categories: ['all'] },
  { id: 'cop_2', code: 'FLAT500',   discount: 500, type: 'flat',    minOrder: 3000,  maxUses: 50,  usedCount: 12, expiry: '2026-09-30', active: true, categories: ['all'] },
  { id: 'cop_3', code: 'WEDDING25', discount: 25,  type: 'percent', minOrder: 10000, maxUses: 30,  usedCount: 8,  expiry: '2026-11-30', active: true, categories: ['cat_2'] },
];

const admin = {
  categories:    loadData('categories.json',    DEFAULT_CATEGORIES),
  subcategories: loadData('subcategories.json', DEFAULT_SUBCATEGORIES),
  services:      loadData('services.json',      DEFAULT_SERVICES),
  addons:        loadData('addons.json',        DEFAULT_ADDONS),
  banners:       loadData('banners.json',       DEFAULT_BANNERS),
  coupons:       loadData('coupons.json',       DEFAULT_COUPONS),
};

const save = {
  customers:     () => saveData('customers.json',     store.customers),
  photographers: () => saveData('photographers.json', store.photographers),
  bookings:      () => saveData('bookings.json',      store.bookings),
  categories:    () => saveData('categories.json',    admin.categories),
  subcategories: () => saveData('subcategories.json', admin.subcategories),
  services:      () => saveData('services.json',      admin.services),
  addons:        () => saveData('addons.json',        admin.addons),
  banners:       () => saveData('banners.json',       admin.banners),
  coupons:       () => saveData('coupons.json',       admin.coupons),
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/check-email
app.post('/api/auth/check-email', (req, res) => {
  const { email, role } = req.body;
  const collection = role === 'photographer' ? store.photographers : store.customers;
  const user = collection.find(u => u.email === (email || '').toLowerCase().trim());
  if (!user) return res.json({ exists: false, passwordSet: false, banned: false });
  res.json({
    exists: true,
    passwordSet: user.passwordSet !== false,
    banned: user.banned === true,
  });
});

// POST /api/auth/set-password
app.post('/api/auth/set-password', (req, res) => {
  const { email, password, role } = req.body;
  const collection = role === 'photographer' ? store.photographers : store.customers;
  const user = collection.find(u => u.email === (email || '').toLowerCase().trim());
  if (!user) return res.status(404).json({ error: 'Account not found' });
  if (user.passwordSet !== false) return res.status(400).json({ error: 'Password already set' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  user.password = password;
  user.passwordSet = true;
  if (role === 'photographer') save.photographers(); else save.customers();
  res.json({ ok: true });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const collection = role === 'photographer' ? store.photographers : store.customers;
  const user = collection.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  // Check banned before anything else
  if (user.banned === true) {
    return res.status(403).json({
      error: `Your account has been suspended. Reason: ${user.banReason || 'Policy violation'}`,
      banned: true,
    });
  }

  // New photographers created from admin have no password yet
  if (role === 'photographer' && user.passwordSet === false) {
    return res.status(401).json({
      error: 'Please set your password to continue.',
      needsPasswordSetup: true,
    });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...safe } = user;
  res.json({ user: safe, role });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (store.customers.find(c => c.email === email))
    return res.status(400).json({ error: 'Email already registered' });
  const customer = {
    id: `customer_${Date.now()}`, name, email, password, phone,
    banned: false, banReason: null,
    joinedAt: Date.now(),
  };
  store.customers.push(customer);
  save.customers();
  const { password: _, ...safe } = customer;
  res.json({ user: safe, role: 'customer' });
});

// ─── OTP (in-memory, otp returned in response for demo) ───────────────────────
const otpStore = {};

app.post('/api/auth/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email.toLowerCase()] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
  res.json({ message: 'OTP sent', otp });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[(email || '').toLowerCase()];
  if (!record) return res.status(400).json({ error: 'OTP not found. Request a new one.' });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email.toLowerCase()];
    return res.status(400).json({ error: 'OTP has expired' });
  }
  if (record.otp !== otp) return res.status(400).json({ error: 'Incorrect OTP' });
  delete otpStore[email.toLowerCase()];
  res.json({ verified: true });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, password, role } = req.body;
  if (role === 'photographer') {
    const photographer = store.photographers.find(p => p.email === email);
    if (!photographer) return res.status(404).json({ error: 'Account not found' });
    photographer.password = password;
    photographer.passwordSet = true;
    save.photographers();
    return res.json({ ok: true });
  }
  const customer = store.customers.find(c => c.email === email);
  if (!customer) return res.status(404).json({ error: 'Account not found' });
  customer.password = password;
  save.customers();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/bookings/photographer', (req, res) => {
  const { photographerId } = req.query;
  const bookings = store.bookings.filter(
    b => b.status === 'requested' || b.photographerId === photographerId
  );
  res.json(bookings.slice().reverse());
});

app.get('/api/bookings/customer/:customerId', (req, res) => {
  res.json(store.bookings.filter(b => b.customerId === req.params.customerId).slice().reverse());
});

app.get('/api/bookings', (req, res) => {
  res.json(store.bookings.slice().reverse());
});

app.post('/api/bookings', (req, res) => {
  const booking = { id: `BK${Date.now()}`, createdAt: Date.now(), status: 'requested', photographerId: null, photographerName: null, ...req.body };
  store.bookings.push(booking);
  save.bookings();
  res.json(booking);
});

app.get('/api/bookings/:id', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  res.json(b);
});

app.patch('/api/bookings/:id/accept', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (b.status !== 'requested') return res.status(400).json({ error: 'Booking already handled' });

  const { photographerId, photographerName } = req.body;

  // Calculate pricing from photographer's rates
  const photographer = store.photographers.find(p => p.id === photographerId);
  const provSvcs   = (photographer && photographer.services)   || [];
  const provAddons = (photographer && photographer.addons)     || [];
  const selSvcs    = b.selectedServices  || [];
  const selAddons  = b.selectedAddons    || [];

  const lineItems = [];
  let requirementCost = 0;

  for (const ss of selSvcs) {
    const ps = provSvcs.find(s => s.id === ss.id) || {};
    const pricePerHour = parseFloat(ps.pricePerHour) || 0;
    const hours        = parseFloat(ss.hours)        || 1;
    const numProviders = parseFloat(ss.numProviders) || 1;
    const cost = pricePerHour * hours * numProviders;
    requirementCost += cost;
    lineItems.push({ label: `${ss.name} (${Math.round(hours)}h × ${Math.round(numProviders)})`, amount: cost });
  }

  for (const sa of selAddons) {
    const pa = provAddons.find(a => a.id === sa.id) || {};
    const price = parseFloat(pa.price) || 0;
    requirementCost += price;
    lineItems.push({ label: sa.name, amount: price });
  }

  const convenienceFee = 450;
  const platformFee    = 10;
  const subtotal       = requirementCost + convenienceFee + platformFee;
  const gstPercent     = 18;
  const gstAmount      = Math.round(subtotal * gstPercent / 100);
  const total          = subtotal + gstAmount;

  lineItems.push({ label: 'Convenience Fee', amount: convenienceFee });
  lineItems.push({ label: 'Platform Fee',    amount: platformFee    });
  lineItems.push({ label: `GST (${gstPercent}%)`, amount: gstAmount });

  b.status                = 'accepted';
  b.photographerId        = photographerId;
  b.photographerName      = photographerName;
  b.photographerImageUrl  = photographer ? (photographer.imageUrl || null) : null;
  b.photographerRating    = photographer ? (photographer.rating || 0) : 0;
  b.acceptedAt            = Date.now();
  b.requirementCost  = requirementCost;
  b.convenienceFee   = convenienceFee;
  b.platformFee      = platformFee;
  b.gstPercent       = gstPercent;
  b.gstAmount        = gstAmount;
  b.total            = total;
  b.lineItems        = lineItems;

  save.bookings();
  res.json(b);
});

app.patch('/api/bookings/:id/reject', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  b.status = 'rejected'; b.rejectedAt = Date.now();
  save.bookings();
  res.json(b);
});

app.patch('/api/bookings/:id/pay', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (b.status !== 'accepted') return res.status(400).json({ error: 'Booking is not in accepted state' });
  b.status = 'confirmed'; b.paidAt = Date.now();
  save.bookings();
  res.json(b);
});

app.patch('/api/bookings/:id/cancel', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  b.status = 'cancelled'; b.cancelledAt = Date.now();
  save.bookings();
  res.json(b);
});

app.patch('/api/bookings/:id/complete', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  b.status = 'completed'; b.completedAt = Date.now();
  save.bookings();
  res.json(b);
});

// Generate OTP for job start (sent to customer, photographer enters it)
app.post('/api/bookings/:id/start-otp', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (b.status !== 'confirmed' && b.status !== 'accepted') return res.status(400).json({ error: 'Booking is not in confirmed state' });
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  b.startOtp = otp;
  save.bookings();
  res.json({ otp });
});

// Verify start OTP → mark as started
app.post('/api/bookings/:id/verify-start', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (!b.startOtp || b.startOtp !== String(req.body.otp))
    return res.status(400).json({ error: 'Invalid OTP' });
  b.status = 'started'; b.startOtp = null; b.startedAt = Date.now();
  save.bookings();
  res.json(b);
});

// Generate OTP for job end (sent to customer, photographer enters it)
app.post('/api/bookings/:id/end-otp', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (b.status !== 'started') return res.status(400).json({ error: 'Job has not been started' });
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  b.endOtp = otp;
  save.bookings();
  res.json({ otp });
});

// Verify end OTP → mark as completed
app.post('/api/bookings/:id/verify-end', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (!b.endOtp || b.endOtp !== String(req.body.otp))
    return res.status(400).json({ error: 'Invalid OTP' });
  b.status = 'completed'; b.endOtp = null; b.completedAt = Date.now();
  save.bookings();
  res.json(b);
});

app.patch('/api/bookings/:id', (req, res) => {
  const b = store.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  Object.assign(b, req.body);
  save.bookings();
  res.json(b);
});

app.delete('/api/bookings/:id', (req, res) => {
  const idx = store.bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  store.bookings.splice(idx, 1);
  save.bookings();
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHOTOGRAPHERS / PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/photographers', (req, res) => {
  res.json(store.photographers.map(({ password: _, ...p }) => p));
});

// GET /api/photographers/by-email?email=xxx  (for studio app password setup)
app.get('/api/photographers/by-email', (req, res) => {
  const email = (req.query.email || '').toLowerCase().trim();
  const p = store.photographers.find(p => p.email === email);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { password: _, ...safe } = p;
  res.json(safe);
});

app.get('/api/photographers/:id', (req, res) => {
  const p = store.photographers.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { password: _, ...safe } = p;
  res.json(safe);
});

app.post('/api/photographers', (req, res) => {
  if (store.photographers.find(p => p.email === req.body.email))
    return res.status(400).json({ error: 'Email already registered' });
  const p = {
    id: `photographer_${Date.now()}`,
    rating: 0, totalBookings: 0, active: true,
    contactPerson: '', categories: [], about: '', imageUrl: null,
    services: [], addons: [], portfolioPhotos: [], portfolioVideos: [],
    banned: false, banReason: null, passwordSet: false,
    joinedAt: Date.now(),
    ...req.body,
  };
  store.photographers.push(p);
  save.photographers();
  const { password: _, ...safe } = p;
  res.json(safe);
});

const TRACKED_FIELDS = ['name','contactPerson','email','phone','bio','about',
  'specializations','categories','services','addons','portfolioPhotos','portfolioVideos',
  'active','imageUrl','rating'];

function appendLog(p, source, changedBy, updates) {
  if (!p.changeLog) p.changeLog = [];
  const changed = TRACKED_FIELDS.filter(k => k in updates && JSON.stringify(p[k]) !== JSON.stringify(updates[k]));
  if (!changed.length) return;
  p.changeLog.unshift({
    id: `log_${Date.now()}`,
    timestamp: Date.now(),
    source,
    changedBy: changedBy || (source === 'studio' ? p.name : 'Admin'),
    fields: changed,
  });
  if (p.changeLog.length > 100) p.changeLog.length = 100;
}

app.patch('/api/photographers/:id', (req, res) => {
  const p = store.photographers.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { _source, _changedBy, ...updates } = req.body;
  const source = _source || 'admin';
  appendLog(p, source, _changedBy, updates);
  Object.assign(p, updates);
  save.photographers();
  const { password: _, ...safe } = p;
  res.json(safe);
});

// Ban photographer
app.patch('/api/photographers/:id/ban', (req, res) => {
  const p = store.photographers.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  appendLog(p, 'admin', 'Admin', { banned: true });
  p.banned = true;
  p.banReason = req.body.reason || 'Policy violation';
  save.photographers();
  const { password: _, ...safe } = p;
  res.json(safe);
});

// Unban photographer
app.patch('/api/photographers/:id/unban', (req, res) => {
  const p = store.photographers.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  appendLog(p, 'admin', 'Admin', { banned: false });
  p.banned = false;
  p.banReason = null;
  save.photographers();
  const { password: _, ...safe } = p;
  res.json(safe);
});

app.delete('/api/photographers/:id', (req, res) => {
  const idx = store.photographers.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  store.photographers.splice(idx, 1);
  save.photographers();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/customers', (req, res) => {
  res.json(store.customers.map(({ password: _, ...c }) => c));
});

app.patch('/api/customers/:id', (req, res) => {
  const c = store.customers.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  Object.assign(c, req.body);
  save.customers();
  const { password: _, ...safe } = c;
  res.json(safe);
});

// Ban customer
app.patch('/api/customers/:id/ban', (req, res) => {
  const c = store.customers.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  c.banned = true;
  c.banReason = req.body.reason || 'Policy violation';
  save.customers();
  const { password: _, ...safe } = c;
  res.json(safe);
});

// Unban customer
app.patch('/api/customers/:id/unban', (req, res) => {
  const c = store.customers.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  c.banned = false;
  c.banReason = null;
  save.customers();
  const { password: _, ...safe } = c;
  res.json(safe);
});

app.delete('/api/customers/:id', (req, res) => {
  const idx = store.customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  store.customers.splice(idx, 1);
  save.customers();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/stats', (req, res) => {
  const b = store.bookings;
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  res.json({
    totalBookings: b.length,
    requested: b.filter(x => x.status === 'requested').length,
    accepted: b.filter(x => x.status === 'accepted').length,
    confirmed: b.filter(x => x.status === 'confirmed').length,
    completed: b.filter(x => x.status === 'completed').length,
    cancelled: b.filter(x => x.status === 'cancelled').length,
    rejected: b.filter(x => x.status === 'rejected').length,
    totalRevenue: b.filter(x => x.status === 'completed').reduce((s, x) => s + (x.total || 0), 0),
    monthRevenue: b.filter(x => x.status === 'completed' && x.createdAt > monthAgo).reduce((s, x) => s + (x.total || 0), 0),
    totalCustomers: store.customers.length,
    totalPhotographers: store.photographers.length,
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD (images + videos)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/upload', (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'No data provided' });

  // Accept images and videos
  const match = data.match(/^data:(image\/(?:png|jpeg)|video\/(?:mp4|webm|quicktime));base64,(.+)$/);
  if (!match) return res.status(400).json({ error: 'Unsupported file type. Accept: PNG, JPEG, MP4, WebM, QuickTime' });

  const mimeType = match[1];
  const base64Data = match[2];

  let ext;
  switch (mimeType) {
    case 'image/png':       ext = 'png';  break;
    case 'image/jpeg':      ext = 'jpg';  break;
    case 'video/mp4':       ext = 'mp4';  break;
    case 'video/webm':      ext = 'webm'; break;
    case 'video/quicktime': ext = 'mov';  break;
    default:                ext = 'bin';  break;
  }

  const filename = `upload_${Date.now()}.${ext}`;
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFile(path.join(uploadsDir, filename), buffer, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save file' });
    res.json({ url: `${BASE_URL}/uploads/${filename}` });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/categories', (req, res) => {
  const cats = admin.categories.map(c => ({
    ...c,
    subCount: admin.subcategories.filter(s => s.categoryId === c.id).length,
  }));
  res.json(cats);
});

app.post('/api/categories', (req, res) => {
  const cat = { id: `cat_${Date.now()}`, active: true, createdAt: Date.now(), ...req.body };
  admin.categories.push(cat);
  save.categories();
  res.json(cat);
});

app.patch('/api/categories/:id', (req, res) => {
  const c = admin.categories.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  Object.assign(c, req.body);
  save.categories();
  res.json(c);
});

app.delete('/api/categories/:id', (req, res) => {
  const idx = admin.categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  admin.categories.splice(idx, 1);
  save.categories();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUBCATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/subcategories', (req, res) => {
  const { categoryId } = req.query;
  const list = categoryId
    ? admin.subcategories.filter(s => s.categoryId === categoryId)
    : admin.subcategories;
  const withCat = list.map(s => ({
    ...s,
    categoryName: admin.categories.find(c => c.id === s.categoryId)?.name || '—',
  }));
  res.json(withCat);
});

app.post('/api/subcategories', (req, res) => {
  const sub = { id: `sub_${Date.now()}`, active: true, ...req.body };
  admin.subcategories.push(sub);
  save.subcategories();
  res.json(sub);
});

app.patch('/api/subcategories/:id', (req, res) => {
  const s = admin.subcategories.find(s => s.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  Object.assign(s, req.body);
  save.subcategories();
  res.json(s);
});

app.delete('/api/subcategories/:id', (req, res) => {
  const idx = admin.subcategories.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  admin.subcategories.splice(idx, 1);
  save.subcategories();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/services', (req, res) => {
  const list = admin.services.map(s => ({
    ...s,
    categoryName: s.categoryId === 'all' ? 'All' : (admin.categories.find(c => c.id === s.categoryId)?.name || '—'),
  }));
  res.json(list);
});

app.post('/api/services', (req, res) => {
  const svc = { id: `svc_${Date.now()}`, active: true, ...req.body };
  admin.services.push(svc);
  save.services();
  res.json(svc);
});

app.patch('/api/services/:id', (req, res) => {
  const s = admin.services.find(s => s.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  Object.assign(s, req.body);
  save.services();
  res.json(s);
});

app.delete('/api/services/:id', (req, res) => {
  const idx = admin.services.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  admin.services.splice(idx, 1);
  save.services();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADDONS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/addons', (req, res) => res.json(admin.addons));

app.post('/api/addons', (req, res) => {
  const a = { id: `add_${Date.now()}`, active: true, ...req.body };
  admin.addons.push(a);
  save.addons();
  res.json(a);
});

app.patch('/api/addons/:id', (req, res) => {
  const a = admin.addons.find(a => a.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  Object.assign(a, req.body);
  save.addons();
  res.json(a);
});

app.delete('/api/addons/:id', (req, res) => {
  const idx = admin.addons.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  admin.addons.splice(idx, 1);
  save.addons();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BANNERS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/banners', (req, res) => res.json(admin.banners));

app.post('/api/banners', (req, res) => {
  const b = { id: `ban_${Date.now()}`, active: true, createdAt: Date.now(), ...req.body };
  admin.banners.push(b);
  save.banners();
  res.json(b);
});

app.patch('/api/banners/:id', (req, res) => {
  const b = admin.banners.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  Object.assign(b, req.body);
  save.banners();
  res.json(b);
});

app.delete('/api/banners/:id', (req, res) => {
  const idx = admin.banners.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  admin.banners.splice(idx, 1);
  save.banners();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COUPONS
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/coupons', (req, res) => res.json(admin.coupons));

app.post('/api/coupons', (req, res) => {
  if (admin.coupons.find(c => c.code === req.body.code))
    return res.status(400).json({ error: 'Coupon code already exists' });
  const c = { id: `cop_${Date.now()}`, active: true, usedCount: 0, ...req.body };
  admin.coupons.push(c);
  save.coupons();
  res.json(c);
});

app.patch('/api/coupons/:id', (req, res) => {
  const c = admin.coupons.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  Object.assign(c, req.body);
  save.coupons();
  res.json(c);
});

app.delete('/api/coupons/:id', (req, res) => {
  const idx = admin.coupons.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  admin.coupons.splice(idx, 1);
  save.coupons();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS (derived from completed bookings)
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/payments', (req, res) => {
  const payments = store.bookings
    .filter(b => b.status === 'completed')
    .map(b => ({
      id: `PAY-${b.id}`,
      bookingId: b.id,
      customerName: b.customerName || '—',
      photographerName: b.photographerName || '—',
      category: b.category || '—',
      amount: b.total || 0,
      date: b.completedAt || b.createdAt,
      method: 'Online',
      status: 'paid',
    }))
    .reverse();
  res.json(payments);
});

// ═══════════════════════════════════════════════════════════════════════════════
// COUPON VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/coupons/validate', (req, res) => {
  const { code, amount, category } = req.body;
  const coupon = admin.coupons.find(c => c.code === (code || '').toUpperCase() && c.active !== false);
  if (!coupon) return res.status(400).json({ error: 'Invalid coupon code' });
  if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' });
  if (new Date(coupon.expiry) < new Date()) return res.status(400).json({ error: 'Coupon has expired' });
  if (amount < coupon.minOrder) return res.status(400).json({ error: `Minimum order amount ₹${coupon.minOrder} required` });
  // Category check — coupon applies if categories is missing, contains 'all', or contains the booking category id
  if (category && coupon.categories && coupon.categories.length > 0 && !coupon.categories.includes('all')) {
    const cat = admin.categories.find(c => c.id === category || c.name === category);
    const catId = cat ? cat.id : category;
    if (!coupon.categories.includes(catId)) {
      return res.status(400).json({ error: 'Coupon not applicable for this category' });
    }
  }
  const discount = coupon.type === 'percent'
    ? Math.round(amount * coupon.discount / 100)
    : coupon.discount;
  coupon.usedCount = (coupon.usedCount || 0) + 1;
  save.coupons();
  res.json({ valid: true, discount, couponId: coupon.id, message: `${coupon.type === 'percent' ? coupon.discount + '%' : '₹' + coupon.discount} discount applied!` });
});

// ═══════════════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════════════
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n Photographer API Server`);
  console.log(` Local:   http://localhost:${PORT}`);
  console.log(` Network: http://0.0.0.0:${PORT}`);
  console.log(`\n Default credentials:`);
  console.log(`   Photographer: studio@rudimax.com / 123456`);
  console.log(`   Customer:     (sign up via customer app)\n`);
  console.log(` Data persisted to: ${dataDir}\n`);
});
