const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', cors(), express.static(uploadsDir));

// ─── MongoDB ──────────────────────────────────────────────────────────────────
let _db;
function col(name) { return _db.collection(name); }

// ─── Default data ─────────────────────────────────────────────────────────────
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
  { id: 'svc_1', name: 'Photography',               active: true },
  { id: 'svc_2', name: 'Videography',               active: true },
  { id: 'svc_3', name: 'Photography + Videography', active: true },
  { id: 'svc_4', name: 'Live Streaming',             active: true },
];

const DEFAULT_ADDONS = [
  { id: 'add_1', name: 'Drone Shot',            active: true },
  { id: 'add_2', name: 'Same Day Edit',          active: true },
  { id: 'add_3', name: 'Photo Album (50 pages)', active: true },
  { id: 'add_4', name: 'Cinematography',         active: true },
  { id: 'add_5', name: 'Candid Photography',     active: true },
];

const DEFAULT_COUPONS = [
  { id: 'cop_1', code: 'FIRST20',   discount: 20,  type: 'percent', minOrder: 5000,  maxUses: 100, usedCount: 45, expiry: '2026-12-31', active: true, categories: ['all'] },
  { id: 'cop_2', code: 'FLAT500',   discount: 500, type: 'flat',    minOrder: 3000,  maxUses: 50,  usedCount: 12, expiry: '2026-09-30', active: true, categories: ['all'] },
  { id: 'cop_3', code: 'WEDDING25', discount: 25,  type: 'percent', minOrder: 10000, maxUses: 30,  usedCount: 8,  expiry: '2026-11-30', active: true, categories: ['cat_2'] },
];

async function seedDefaults() {
  if (await col('photographers').countDocuments() === 0)
    await col('photographers').insertMany(DEFAULT_PHOTOGRAPHERS);
  if (await col('categories').countDocuments() === 0)
    await col('categories').insertMany(DEFAULT_CATEGORIES);
  if (await col('subcategories').countDocuments() === 0)
    await col('subcategories').insertMany(DEFAULT_SUBCATEGORIES);
  if (await col('services').countDocuments() === 0)
    await col('services').insertMany(DEFAULT_SERVICES);
  if (await col('addons').countDocuments() === 0)
    await col('addons').insertMany(DEFAULT_ADDONS);
  if (await col('coupons').countDocuments() === 0)
    await col('coupons').insertMany(DEFAULT_COUPONS);
}

// Strip MongoDB _id and optionally password from returned objects
function safe(doc, omitPassword = false) {
  if (!doc) return null;
  const { _id, password, ...rest } = doc;
  if (omitPassword) return rest;
  return { _id: undefined, ...doc, _id: undefined };
}
function safeNoPass(doc) {
  if (!doc) return null;
  const { _id, password, ...rest } = doc;
  return rest;
}
function safeDocs(docs) { return docs.map(d => { const { _id, ...r } = d; return r; }); }
function safeDocsNoPass(docs) { return docs.map(safeNoPass); }

// ─── OTP (in-memory — ephemeral by design) ───────────────────────────────────
const otpStore = {};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/auth/check-email', async (req, res) => {
  try {
    const { email, role } = req.body;
    const collection = role === 'photographer' ? 'photographers' : 'customers';
    const user = await col(collection).findOne({ email: (email || '').toLowerCase().trim() });
    if (!user) return res.json({ exists: false, passwordSet: false, banned: false });
    res.json({ exists: true, passwordSet: user.passwordSet !== false, banned: user.banned === true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/set-password', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const collection = role === 'photographer' ? 'photographers' : 'customers';
    const user = await col(collection).findOne({ email: (email || '').toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (user.passwordSet !== false) return res.status(400).json({ error: 'Password already set' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    await col(collection).updateOne({ id: user.id }, { $set: { password, passwordSet: true } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const collection = role === 'photographer' ? 'photographers' : 'customers';
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await col(collection).findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    if (user.banned === true) {
      return res.status(403).json({
        error: `Your account has been suspended. Reason: ${user.banReason || 'Policy violation'}`,
        banned: true,
      });
    }

    if (role === 'photographer' && user.passwordSet === false) {
      return res.status(401).json({ error: 'Please set your password to continue.', needsPasswordSetup: true });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user: safeNoPass(user), role });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const existing = await col('customers').findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const customer = {
      id: `customer_${Date.now()}`, name, email: normalizedEmail, password, phone,
      banned: false, banReason: null, joinedAt: Date.now(),
    };
    await col('customers').insertOne(customer);
    res.json({ user: safeNoPass(customer), role: 'customer' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

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

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const collection = role === 'photographer' ? 'photographers' : 'customers';
    const user = await col(collection).findOne({ email: (email || '').toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'Account not found' });
    const update = { password };
    if (role === 'photographer') update.passwordSet = true;
    await col(collection).updateOne({ id: user.id }, { $set: update });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/bookings/photographer', async (req, res) => {
  try {
    const { photographerId } = req.query;
    const bookings = await col('bookings').find({
      $or: [{ status: 'requested' }, { photographerId }]
    }).sort({ createdAt: -1 }).toArray();
    res.json(safeDocs(bookings));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/bookings/customer/:customerId', async (req, res) => {
  try {
    const bookings = await col('bookings').find({ customerId: req.params.customerId }).sort({ createdAt: -1 }).toArray();
    res.json(safeDocs(bookings));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await col('bookings').find({}).sort({ createdAt: -1 }).toArray();
    res.json(safeDocs(bookings));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = { id: `BK${Date.now()}`, createdAt: Date.now(), status: 'requested', photographerId: null, photographerName: null, ...req.body };
    await col('bookings').insertOne(booking);
    const { _id, ...result } = booking;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const b = await col('bookings').findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Not found' });
    res.json(safeNoPass(b));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/bookings/:id/accept', async (req, res) => {
  try {
    const b = await col('bookings').findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (b.status !== 'requested') return res.status(400).json({ error: 'Booking already handled' });

    const { photographerId, photographerName } = req.body;
    const photographer = await col('photographers').findOne({ id: photographerId });
    const provSvcs   = (photographer && photographer.services)  || [];
    const provAddons = (photographer && photographer.addons)    || [];
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

    const updates = {
      status: 'accepted',
      photographerId,
      photographerName,
      photographerImageUrl:  photographer ? (photographer.imageUrl || null) : null,
      photographerRating:    photographer ? (photographer.rating || 0) : 0,
      acceptedAt:            Date.now(),
      requirementCost, convenienceFee, platformFee, gstPercent, gstAmount, total, lineItems,
    };

    await col('bookings').updateOne({ id: req.params.id }, { $set: updates });
    const updated = await col('bookings').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/bookings/:id/reject', async (req, res) => {
  try {
    await col('bookings').updateOne({ id: req.params.id }, { $set: { status: 'rejected', rejectedAt: Date.now() } });
    const updated = await col('bookings').findOne({ id: req.params.id });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/bookings/:id/pay', async (req, res) => {
  try {
    const b = await col('bookings').findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (b.status !== 'accepted') return res.status(400).json({ error: 'Booking is not in accepted state' });
    await col('bookings').updateOne({ id: req.params.id }, { $set: { status: 'confirmed', paidAt: Date.now() } });
    const updated = await col('bookings').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/bookings/:id/cancel', async (req, res) => {
  try {
    await col('bookings').updateOne({ id: req.params.id }, { $set: { status: 'cancelled', cancelledAt: Date.now() } });
    const updated = await col('bookings').findOne({ id: req.params.id });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/bookings/:id/complete', async (req, res) => {
  try {
    await col('bookings').updateOne({ id: req.params.id }, { $set: { status: 'completed', completedAt: Date.now() } });
    const updated = await col('bookings').findOne({ id: req.params.id });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings/:id/start-otp', async (req, res) => {
  try {
    const b = await col('bookings').findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (b.status !== 'confirmed' && b.status !== 'accepted') return res.status(400).json({ error: 'Booking is not in confirmed state' });
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await col('bookings').updateOne({ id: req.params.id }, { $set: { startOtp: otp } });
    res.json({ otp });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings/:id/verify-start', async (req, res) => {
  try {
    const b = await col('bookings').findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (!b.startOtp || b.startOtp !== String(req.body.otp))
      return res.status(400).json({ error: 'Invalid OTP' });
    await col('bookings').updateOne({ id: req.params.id }, { $set: { status: 'started', startOtp: null, startedAt: Date.now() } });
    const updated = await col('bookings').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings/:id/end-otp', async (req, res) => {
  try {
    const b = await col('bookings').findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (b.status !== 'started') return res.status(400).json({ error: 'Job has not been started' });
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await col('bookings').updateOne({ id: req.params.id }, { $set: { endOtp: otp } });
    res.json({ otp });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings/:id/verify-end', async (req, res) => {
  try {
    const b = await col('bookings').findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Not found' });
    if (!b.endOtp || b.endOtp !== String(req.body.otp))
      return res.status(400).json({ error: 'Invalid OTP' });
    await col('bookings').updateOne({ id: req.params.id }, { $set: { status: 'completed', endOtp: null, completedAt: Date.now() } });
    const updated = await col('bookings').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const b = await col('bookings').findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Not found' });
    await col('bookings').updateOne({ id: req.params.id }, { $set: req.body });
    const updated = await col('bookings').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const result = await col('bookings').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHOTOGRAPHERS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/photographers', async (req, res) => {
  try {
    const docs = await col('photographers').find({}).toArray();
    res.json(safeDocsNoPass(docs));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/photographers/by-email', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase().trim();
    const p = await col('photographers').findOne({ email });
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(safeNoPass(p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/photographers/:id', async (req, res) => {
  try {
    const p = await col('photographers').findOne({ id: req.params.id });
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(safeNoPass(p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/photographers', async (req, res) => {
  try {
    const existing = await col('photographers').findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const p = {
      id: `photographer_${Date.now()}`,
      rating: 0, totalBookings: 0, active: true,
      contactPerson: '', categories: [], about: '', imageUrl: null,
      services: [], addons: [], portfolioPhotos: [], portfolioVideos: [],
      banned: false, banReason: null, passwordSet: false,
      joinedAt: Date.now(),
      ...req.body,
    };
    await col('photographers').insertOne(p);
    res.json(safeNoPass(p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const TRACKED_FIELDS = ['name','contactPerson','email','phone','bio','about',
  'specializations','categories','services','addons','portfolioPhotos','portfolioVideos',
  'active','imageUrl','rating'];

app.patch('/api/photographers/:id', async (req, res) => {
  try {
    const p = await col('photographers').findOne({ id: req.params.id });
    if (!p) return res.status(404).json({ error: 'Not found' });
    const { _source, _changedBy, ...updates } = req.body;
    const source = _source || 'admin';
    const changedBy = _changedBy || (source === 'studio' ? p.name : 'Admin');

    const changed = TRACKED_FIELDS.filter(k => k in updates && JSON.stringify(p[k]) !== JSON.stringify(updates[k]));
    const logEntry = changed.length ? {
      id: `log_${Date.now()}`,
      timestamp: Date.now(),
      source, changedBy, fields: changed,
    } : null;

    const setOps = { ...updates };
    const pushOps = logEntry ? { changeLog: { $each: [logEntry], $position: 0, $slice: 100 } } : {};

    const mongoUpdate = { $set: setOps };
    if (logEntry) mongoUpdate.$push = pushOps;

    await col('photographers').updateOne({ id: req.params.id }, mongoUpdate);
    const updated = await col('photographers').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/photographers/:id/ban', async (req, res) => {
  try {
    const p = await col('photographers').findOne({ id: req.params.id });
    if (!p) return res.status(404).json({ error: 'Not found' });
    const logEntry = { id: `log_${Date.now()}`, timestamp: Date.now(), source: 'admin', changedBy: 'Admin', fields: ['banned'] };
    await col('photographers').updateOne({ id: req.params.id }, {
      $set: { banned: true, banReason: req.body.reason || 'Policy violation' },
      $push: { changeLog: { $each: [logEntry], $position: 0, $slice: 100 } },
    });
    const updated = await col('photographers').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/photographers/:id/unban', async (req, res) => {
  try {
    const p = await col('photographers').findOne({ id: req.params.id });
    if (!p) return res.status(404).json({ error: 'Not found' });
    const logEntry = { id: `log_${Date.now()}`, timestamp: Date.now(), source: 'admin', changedBy: 'Admin', fields: ['banned'] };
    await col('photographers').updateOne({ id: req.params.id }, {
      $set: { banned: false, banReason: null },
      $push: { changeLog: { $each: [logEntry], $position: 0, $slice: 100 } },
    });
    const updated = await col('photographers').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/photographers/:id', async (req, res) => {
  try {
    const result = await col('photographers').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/customers', async (req, res) => {
  try {
    const docs = await col('customers').find({}).toArray();
    res.json(safeDocsNoPass(docs));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/customers/:id', async (req, res) => {
  try {
    const c = await col('customers').findOne({ id: req.params.id });
    if (!c) return res.status(404).json({ error: 'Not found' });
    await col('customers').updateOne({ id: req.params.id }, { $set: req.body });
    const updated = await col('customers').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/customers/:id/ban', async (req, res) => {
  try {
    const c = await col('customers').findOne({ id: req.params.id });
    if (!c) return res.status(404).json({ error: 'Not found' });
    await col('customers').updateOne({ id: req.params.id }, { $set: { banned: true, banReason: req.body.reason || 'Policy violation' } });
    const updated = await col('customers').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/customers/:id/unban', async (req, res) => {
  try {
    const c = await col('customers').findOne({ id: req.params.id });
    if (!c) return res.status(404).json({ error: 'Not found' });
    await col('customers').updateOne({ id: req.params.id }, { $set: { banned: false, banReason: null } });
    const updated = await col('customers').findOne({ id: req.params.id });
    res.json(safeNoPass(updated));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const result = await col('customers').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/stats', async (req, res) => {
  try {
    const [bookings, customerCount, photographerCount] = await Promise.all([
      col('bookings').find({}).toArray(),
      col('customers').countDocuments(),
      col('photographers').countDocuments(),
    ]);
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    res.json({
      totalBookings:      bookings.length,
      requested:          bookings.filter(x => x.status === 'requested').length,
      accepted:           bookings.filter(x => x.status === 'accepted').length,
      confirmed:          bookings.filter(x => x.status === 'confirmed').length,
      completed:          bookings.filter(x => x.status === 'completed').length,
      cancelled:          bookings.filter(x => x.status === 'cancelled').length,
      rejected:           bookings.filter(x => x.status === 'rejected').length,
      totalRevenue:       bookings.filter(x => x.status === 'completed').reduce((s, x) => s + (x.total || 0), 0),
      monthRevenue:       bookings.filter(x => x.status === 'completed' && x.createdAt > monthAgo).reduce((s, x) => s + (x.total || 0), 0),
      totalCustomers:     customerCount,
      totalPhotographers: photographerCount,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/upload', (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'No data provided' });

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

app.get('/api/categories', async (req, res) => {
  try {
    const [cats, subs] = await Promise.all([
      col('categories').find({}).toArray(),
      col('subcategories').find({}).toArray(),
    ]);
    res.json(cats.map(c => {
      const { _id, ...rest } = c;
      return { ...rest, subCount: subs.filter(s => s.categoryId === c.id).length };
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/categories', async (req, res) => {
  try {
    const cat = { id: `cat_${Date.now()}`, active: true, createdAt: Date.now(), ...req.body };
    await col('categories').insertOne(cat);
    const { _id, ...result } = cat;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/categories/:id', async (req, res) => {
  try {
    const c = await col('categories').findOne({ id: req.params.id });
    if (!c) return res.status(404).json({ error: 'Not found' });
    await col('categories').updateOne({ id: req.params.id }, { $set: req.body });
    const updated = await col('categories').findOne({ id: req.params.id });
    const { _id, ...result } = updated;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const result = await col('categories').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUBCATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/subcategories', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const query = categoryId ? { categoryId } : {};
    const [subs, cats] = await Promise.all([
      col('subcategories').find(query).toArray(),
      col('categories').find({}).toArray(),
    ]);
    res.json(subs.map(s => {
      const { _id, ...rest } = s;
      return { ...rest, categoryName: cats.find(c => c.id === s.categoryId)?.name || '—' };
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/subcategories', async (req, res) => {
  try {
    const sub = { id: `sub_${Date.now()}`, active: true, ...req.body };
    await col('subcategories').insertOne(sub);
    const { _id, ...result } = sub;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/subcategories/:id', async (req, res) => {
  try {
    const s = await col('subcategories').findOne({ id: req.params.id });
    if (!s) return res.status(404).json({ error: 'Not found' });
    await col('subcategories').updateOne({ id: req.params.id }, { $set: req.body });
    const updated = await col('subcategories').findOne({ id: req.params.id });
    const { _id, ...result } = updated;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/subcategories/:id', async (req, res) => {
  try {
    const result = await col('subcategories').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/services', async (req, res) => {
  try {
    const [svcs, cats] = await Promise.all([
      col('services').find({}).toArray(),
      col('categories').find({}).toArray(),
    ]);
    res.json(svcs.map(s => {
      const { _id, ...rest } = s;
      return { ...rest, categoryName: s.categoryId === 'all' ? 'All' : (cats.find(c => c.id === s.categoryId)?.name || '—') };
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/services', async (req, res) => {
  try {
    const svc = { id: `svc_${Date.now()}`, active: true, ...req.body };
    await col('services').insertOne(svc);
    const { _id, ...result } = svc;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/services/:id', async (req, res) => {
  try {
    const s = await col('services').findOne({ id: req.params.id });
    if (!s) return res.status(404).json({ error: 'Not found' });
    await col('services').updateOne({ id: req.params.id }, { $set: req.body });
    const updated = await col('services').findOne({ id: req.params.id });
    const { _id, ...result } = updated;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const result = await col('services').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADDONS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/addons', async (req, res) => {
  try {
    const docs = await col('addons').find({}).toArray();
    res.json(safeDocs(docs));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/addons', async (req, res) => {
  try {
    const a = { id: `add_${Date.now()}`, active: true, ...req.body };
    await col('addons').insertOne(a);
    const { _id, ...result } = a;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/addons/:id', async (req, res) => {
  try {
    const a = await col('addons').findOne({ id: req.params.id });
    if (!a) return res.status(404).json({ error: 'Not found' });
    await col('addons').updateOne({ id: req.params.id }, { $set: req.body });
    const updated = await col('addons').findOne({ id: req.params.id });
    const { _id, ...result } = updated;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/addons/:id', async (req, res) => {
  try {
    const result = await col('addons').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// BANNERS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/banners', async (req, res) => {
  try {
    const docs = await col('banners').find({}).toArray();
    res.json(safeDocs(docs));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/banners', async (req, res) => {
  try {
    const b = { id: `ban_${Date.now()}`, active: true, createdAt: Date.now(), ...req.body };
    await col('banners').insertOne(b);
    const { _id, ...result } = b;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/banners/:id', async (req, res) => {
  try {
    const b = await col('banners').findOne({ id: req.params.id });
    if (!b) return res.status(404).json({ error: 'Not found' });
    await col('banners').updateOne({ id: req.params.id }, { $set: req.body });
    const updated = await col('banners').findOne({ id: req.params.id });
    const { _id, ...result } = updated;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    const result = await col('banners').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// COUPONS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/coupons', async (req, res) => {
  try {
    const docs = await col('coupons').find({}).toArray();
    res.json(safeDocs(docs));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const existing = await col('coupons').findOne({ code: req.body.code });
    if (existing) return res.status(400).json({ error: 'Coupon code already exists' });
    const c = { id: `cop_${Date.now()}`, active: true, usedCount: 0, ...req.body };
    await col('coupons').insertOne(c);
    const { _id, ...result } = c;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/coupons/:id', async (req, res) => {
  try {
    const c = await col('coupons').findOne({ id: req.params.id });
    if (!c) return res.status(404).json({ error: 'Not found' });
    await col('coupons').updateOne({ id: req.params.id }, { $set: req.body });
    const updated = await col('coupons').findOne({ id: req.params.id });
    const { _id, ...result } = updated;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/coupons/:id', async (req, res) => {
  try {
    const result = await col('coupons').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS (derived from completed bookings)
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/payments', async (req, res) => {
  try {
    const bookings = await col('bookings').find({ status: 'completed' }).sort({ completedAt: -1 }).toArray();
    const payments = bookings.map(b => ({
      id: `PAY-${b.id}`,
      bookingId: b.id,
      customerName:     b.customerName     || '—',
      photographerName: b.photographerName || '—',
      category:         b.category         || '—',
      amount:           b.total            || 0,
      date:             b.completedAt      || b.createdAt,
      method: 'Online',
      status: 'paid',
    }));
    res.json(payments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// COUPON VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, amount, category } = req.body;
    const coupon = await col('coupons').findOne({ code: (code || '').toUpperCase(), active: { $ne: false } });
    if (!coupon) return res.status(400).json({ error: 'Invalid coupon code' });
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' });
    if (new Date(coupon.expiry) < new Date()) return res.status(400).json({ error: 'Coupon has expired' });
    if (amount < coupon.minOrder) return res.status(400).json({ error: `Minimum order amount ₹${coupon.minOrder} required` });

    if (category && coupon.categories && coupon.categories.length > 0 && !coupon.categories.includes('all')) {
      const cat = await col('categories').findOne({ $or: [{ id: category }, { name: category }] });
      const catId = cat ? cat.id : category;
      if (!coupon.categories.includes(catId)) {
        return res.status(400).json({ error: 'Coupon not applicable for this category' });
      }
    }

    const discount = coupon.type === 'percent'
      ? Math.round(amount * coupon.discount / 100)
      : coupon.discount;

    await col('coupons').updateOne({ id: coupon.id }, { $inc: { usedCount: 1 } });
    res.json({
      valid: true, discount, couponId: coupon.id,
      message: `${coupon.type === 'percent' ? coupon.discount + '%' : '₹' + coupon.discount} discount applied!`,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI environment variable is not set.');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  _db = client.db('photographer_app');
  console.log('Connected to MongoDB');

  await seedDefaults();
  console.log('Default data seeded (skipped if already present)');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n Photographer API Server`);
    console.log(` Local:   http://localhost:${PORT}`);
    console.log(`\n Default credentials:`);
    console.log(`   Photographer: studio@rudimax.com / 123456`);
    console.log(`   Customer:     (sign up via customer app)\n`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
