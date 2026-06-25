'use strict';

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// ─── Data layer ───────────────────────────────────────────────────────────────

const DATA_DIR = path.join(ROOT, 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function dataPath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readData(name) {
  const file = dataPath(name);
  if (!fs.existsSync(file)) {
    const seed = path.join(ROOT, 'seeds', `${name}.seed.json`);
    if (fs.existsSync(seed)) {
      const data = JSON.parse(fs.readFileSync(seed, 'utf8'));
      writeData(name, data);
      return data;
    }
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeData(name, data) {
  ensureDataDir();
  fs.writeFileSync(dataPath(name), JSON.stringify(data, null, 2));
}

// ─── Lazy-load libs (graceful if not installed yet) ───────────────────────────

let cal, email, bcrypt, jwt, uuidv4;
try { cal    = require('./lib/calendar'); } catch (e) { cal = null; }
try { email  = require('./lib/email');    } catch (e) { email = null; }
try { bcrypt = require('bcryptjs');       } catch (e) { bcrypt = null; }
try { jwt    = require('jsonwebtoken');   } catch (e) { jwt = null; }
try { ({ v4: uuidv4 } = require('uuid')); } catch (e) { uuidv4 = () => 'id_' + Date.now() + Math.random().toString(36).slice(2, 7); }

const JWT_SECRET = process.env.JWT_SECRET || 'atrya_dev_secret_change_in_prod';
const JWT_EXPIRY = '7d';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.set('trust proxy', 1); // Railway runs behind a reverse proxy — needed for req.protocol to return https
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.replace('Bearer ', '').trim();
  if (!token || !jwt) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// ─── Static files ─────────────────────────────────────────────────────────────

app.use(express.static(ROOT, {
  etag: true,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  service: 'atrya',
  calendar: cal?.isConfigured() || false,
  email: email?.isEmailConfigured() || false,
}));

// ─── Public scheduling API ────────────────────────────────────────────────────

// GET /api/schedule/interviewer?host=phil&type=intro
app.get('/api/schedule/interviewer', (req, res) => {
  const host = (req.query.host || '').toLowerCase();
  const type = (req.query.type || '').toLowerCase();

  const interviewers = readData('interviewers') || [];
  const interviewer  = interviewers.find(i => i.id === host && i.active);
  if (!interviewer) return res.status(404).json({ error: 'Interviewer not found' });

  const settings    = readData('settings') || {};
  const bookingType = type
    ? interviewer.bookingTypes?.find(t => t.id === type)
    : interviewer.bookingTypes?.[0];

  const calCfg = cal?.getConfig() || {};

  res.json({
    interviewer: {
      id:    interviewer.id,
      name:  interviewer.name,
      title: interviewer.title,
      bio:   interviewer.bio,
      photo: interviewer.photo,
    },
    bookingType: bookingType || interviewer.bookingTypes?.[0],
    availableTypes: interviewer.bookingTypes || [],
    timezone: settings.timezone || calCfg.timezone || 'Europe/Berlin',
    daysAhead: settings.daysAhead || calCfg.daysAhead || 21,
    hoursStart: settings.workingHoursStart || calCfg.hoursStart || 9,
    hoursEnd:   settings.workingHoursEnd   || calCfg.hoursEnd   || 18,
  });
});

// GET /api/schedule/slots?host=phil&type=intro&date=2026-06-23
app.get('/api/schedule/slots', async (req, res) => {
  const host     = (req.query.host || '').toLowerCase();
  const type     = (req.query.type || '').toLowerCase();
  const dateStr  = req.query.date;

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'Invalid date. Expected YYYY-MM-DD.' });
  }

  const interviewers = readData('interviewers') || [];
  const interviewer  = interviewers.find(i => i.id === host && i.active);
  if (!interviewer) return res.status(404).json({ error: 'Interviewer not found' });

  const bookingType = type
    ? interviewer.bookingTypes?.find(t => t.id === type)
    : interviewer.bookingTypes?.[0];

  const duration = bookingType?.duration || 30;

  try {
    const slots = cal
      ? await cal.getAvailableSlots(dateStr, duration, interviewer)
      : [];
    res.json({ slots, duration, date: dateStr });
  } catch (err) {
    console.error('[slots]', err.message);
    res.status(500).json({ error: 'Failed to fetch availability', detail: err.message });
  }
});

// POST /api/schedule/book
app.post('/api/schedule/book', async (req, res) => {
  const { host, type, slot, candidate } = req.body;

  if (!host || !slot?.startISO || !candidate?.email || !candidate?.firstName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const interviewers = readData('interviewers') || [];
  const interviewer  = interviewers.find(i => i.id === host && i.active);
  if (!interviewer) return res.status(404).json({ error: 'Interviewer not found' });

  const bookingType = type
    ? interviewer.bookingTypes?.find(t => t.id === type)
    : interviewer.bookingTypes?.[0];

  const settings   = readData('settings') || {};
  const baseUrl    = settings.baseUrl || process.env.BASE_URL || 'https://atrya.io';
  const tz         = settings.timezone || 'Europe/Berlin';
  const bookingId  = uuidv4();
  const cancelToken = uuidv4();

  // Create Google Calendar event
  let calEvent = null;
  let meetLink = null;
  try {
    if (cal) {
      const ivInfo = { ...interviewer, bookingType };
      calEvent = await cal.createBookingEvent(slot, candidate, ivInfo);
      meetLink = calEvent?.hangoutLink || calEvent?.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri || null;
    }
  } catch (err) {
    console.error('[booking] calendar error:', err.message);
    // Non-fatal — booking still saved
  }

  const booking = {
    id:           bookingId,
    cancelToken,
    interviewerId: host,
    bookingTypeId: bookingType?.id || 'intro',
    bookingType,
    slot,
    candidate: {
      firstName: candidate.firstName,
      lastName:  candidate.lastName || '',
      email:     candidate.email,
      role:      candidate.role     || '',
      linkedin:  candidate.linkedin || '',
      notes:     candidate.notes    || '',
    },
    calEventId:   calEvent?.id   || null,
    calEventLink: calEvent?.htmlLink || null,
    meetLink,
    status:    'confirmed',
    createdAt: new Date().toISOString(),
  };

  const bookings = readData('bookings') || [];
  bookings.push(booking);
  writeData('bookings', bookings);

  // Send confirmation email to candidate
  try {
    if (email) {
      const cancelUrl = `${baseUrl}/schedule/cancel?token=${cancelToken}`;
      const html = email.renderCandidateConfirmation({
        slot,
        candidate: booking.candidate,
        interviewer: { ...interviewer, bookingType },
        meetLink,
        cancelUrl,
        tz,
      });
      await email.sendMail({
        to:          candidate.email,
        subject:     `Interview confirmed: ${bookingType?.label || 'Interview'} with ${interviewer.name} at Atrya`,
        html,
        interviewer,
      });
    }
  } catch (err) {
    console.error('[booking] candidate email error:', err.message);
  }

  // Send notification to interviewer
  try {
    if (email && interviewer.email) {
      const adminUrl = `${baseUrl}/internal-829163047258/`;
      const html = email.renderInterviewerNotification({
        slot,
        candidate: booking.candidate,
        interviewer: { ...interviewer, bookingType },
        meetLink,
        adminUrl,
        tz,
      });
      await email.sendMail({
        to:          interviewer.email,
        subject:     `New ${bookingType?.label || 'interview'} booked — ${candidate.firstName} ${candidate.lastName || ''}`.trim(),
        html,
        interviewer,
      });
    }
  } catch (err) {
    console.error('[booking] interviewer email error:', err.message);
  }

  res.json({
    success:   true,
    bookingId,
    meetLink,
    calEventLink: calEvent?.htmlLink || null,
    slot,
    interviewer: { name: interviewer.name, photo: interviewer.photo, title: interviewer.title },
    bookingType,
  });
});

// GET /api/schedule/cancel?token=xxx
app.get('/api/schedule/cancel', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const bookings = readData('bookings') || [];
  const booking  = bookings.find(b => b.cancelToken === token && b.status === 'confirmed');
  if (!booking) return res.status(404).json({ error: 'Booking not found or already cancelled' });

  res.json({
    found: true,
    booking: {
      id:        booking.id,
      slot:      booking.slot,
      candidate: { firstName: booking.candidate.firstName },
      interviewer: { name: booking.interviewerId },
      bookingType: booking.bookingType,
    },
  });
});

// POST /api/schedule/cancel
app.post('/api/schedule/cancel', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const bookings = readData('bookings') || [];
  const idx      = bookings.findIndex(b => b.cancelToken === token && b.status === 'confirmed');
  if (idx === -1) return res.status(404).json({ error: 'Booking not found or already cancelled' });

  const booking = bookings[idx];
  bookings[idx] = { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() };
  writeData('bookings', bookings);

  // Remove from Google Calendar
  try {
    if (cal && booking.calEventId) {
      const interviewers = readData('interviewers') || [];
      const interviewer  = interviewers.find(i => i.id === booking.interviewerId);
      await cal.cancelBookingEvent(booking.calEventId, interviewer || null);
    }
  } catch (err) {
    console.error('[cancel] calendar error:', err.message);
  }

  // Send cancellation emails
  try {
    const interviewers = readData('interviewers') || [];
    const interviewer  = interviewers.find(i => i.id === booking.interviewerId);
    const settings     = readData('settings') || {};
    const tz           = settings.timezone || 'Europe/Berlin';

    if (email && interviewer) {
      const html = email.renderCancellationConfirmation({
        slot:        booking.slot,
        candidate:   booking.candidate,
        interviewer: { ...interviewer, bookingType: booking.bookingType },
        tz,
      });
      await email.sendMail({
        to:          booking.candidate.email,
        subject:     `Interview cancelled — ${booking.bookingType?.label || 'Interview'} with ${interviewer.name}`,
        html,
        interviewer,
      });
    }
  } catch (err) {
    console.error('[cancel] email error:', err.message);
  }

  res.json({ success: true });
});

// ─── Admin auth ───────────────────────────────────────────────────────────────

// POST /api/auth/setup  — one-time setup when no admin exists
app.post('/api/auth/setup', async (req, res) => {
  const users = readData('users') || [];
  const hasRealAdmin = users.some(u => u.role === 'admin' && !u.passwordHash.includes('placeholder'));
  if (hasRealAdmin) return res.status(403).json({ error: 'Already configured' });

  const { password } = req.body;
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!bcrypt) return res.status(500).json({ error: 'bcryptjs not installed' });

  const passwordHash = await bcrypt.hash(password, 12);
  const adminUser = { id: 'admin', username: 'admin', passwordHash, role: 'admin' };
  writeData('users', [adminUser]);
  res.json({ success: true, message: 'Admin account created' });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  if (!bcrypt || !jwt) return res.status(500).json({ error: 'Auth libs not installed' });

  const users = readData('users') || [];
  const user  = users.find(u => u.username === username);
  if (!user || user.passwordHash.includes('placeholder')) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  res.json({ token, username: user.username, role: user.role });
});

// ─── Admin API ────────────────────────────────────────────────────────────────

app.get('/api/admin/bookings', requireAuth, (req, res) => {
  const bookings     = readData('bookings') || [];
  const interviewers = readData('interviewers') || [];

  const statusFilter = req.query.status; // confirmed | cancelled | all
  let result = bookings;
  if (statusFilter && statusFilter !== 'all') {
    result = bookings.filter(b => b.status === statusFilter);
  }

  // Sort newest first
  result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ bookings: result, total: result.length });
});

app.get('/api/admin/bookings/:id', requireAuth, (req, res) => {
  const bookings = readData('bookings') || [];
  const booking  = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Not found' });
  res.json({ booking });
});

app.patch('/api/admin/bookings/:id', requireAuth, (req, res) => {
  const bookings = readData('bookings') || [];
  const idx      = bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const allowed = ['status', 'notes'];
  const update  = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  bookings[idx] = { ...bookings[idx], ...update, updatedAt: new Date().toISOString() };
  writeData('bookings', bookings);
  res.json({ booking: bookings[idx] });
});

app.delete('/api/admin/bookings/:id', requireAuth, async (req, res) => {
  const bookings = readData('bookings') || [];
  const idx      = bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const booking = bookings[idx];
  if (booking.calEventId && cal) {
    try {
      const interviewers = readData('interviewers') || [];
      const interviewer  = interviewers.find(i => i.id === booking.interviewerId);
      await cal.cancelBookingEvent(booking.calEventId, interviewer || null);
    } catch (err) {
      console.error('[delete booking] calendar error:', err.message);
    }
  }
  bookings.splice(idx, 1);
  writeData('bookings', bookings);
  res.json({ success: true });
});

app.get('/api/admin/interviewers', requireAuth, (req, res) => {
  const interviewers = readData('interviewers') || [];
  res.json({ interviewers });
});

app.post('/api/admin/interviewers', requireAuth, (req, res) => {
  const { name, title, bio, email, photo, bookingTypes, calendarId, minNotice } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const interviewers = readData('interviewers') || [];
  const id = (req.body.id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    .slice(0, 32);
  if (interviewers.find(i => i.id === id)) {
    return res.status(409).json({ error: `ID "${id}" already exists` });
  }

  const interviewer = {
    id,
    name,
    firstName: name.split(' ')[0],
    title:     title     || '',
    bio:       bio       || '',
    email:     email     || '',
    photo:     photo     || '',
    calendarId: calendarId || null,
    minNotice:  minNotice != null ? Number(minNotice) : 2,
    active:    true,
    bookingTypes: bookingTypes || [
      { id: 'intro', label: 'Intro Call', duration: 30, description: '' },
    ],
  };
  interviewers.push(interviewer);
  writeData('interviewers', interviewers);
  res.status(201).json({ interviewer });
});

app.put('/api/admin/interviewers/:id', requireAuth, (req, res) => {
  const interviewers = readData('interviewers') || [];
  const idx          = interviewers.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const allowed = ['name', 'firstName', 'title', 'bio', 'email', 'photo', 'active', 'bookingTypes', 'calendarId', 'minNotice'];
  const update  = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  // Keep firstName in sync when name changes
  if (update.name && !update.firstName) update.firstName = update.name.split(' ')[0];
  interviewers[idx] = { ...interviewers[idx], ...update };
  writeData('interviewers', interviewers);
  res.json({ interviewer: interviewers[idx] });
});

app.delete('/api/admin/interviewers/:id', requireAuth, (req, res) => {
  const interviewers = readData('interviewers') || [];
  const idx          = interviewers.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  interviewers.splice(idx, 1);
  writeData('interviewers', interviewers);
  res.json({ success: true });
});

app.get('/api/admin/settings', requireAuth, (req, res) => {
  const settings = readData('settings') || {};
  const calCfg   = cal?.getConfig() || {};
  res.json({ settings, calendarConfigured: calCfg.configured || false });
});

app.put('/api/admin/settings', requireAuth, (req, res) => {
  const current = readData('settings') || {};
  const allowed = ['timezone', 'workingHoursStart', 'workingHoursEnd', 'daysAhead', 'minNoticeHours', 'companyName', 'companyEmail', 'baseUrl'];
  const update  = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  const settings = { ...current, ...update };
  writeData('settings', settings);
  res.json({ settings });
});

// ─── Test email ──────────────────────────────────────────────────────────────

app.post('/api/admin/test-email', requireAuth, async (req, res) => {
  if (!email) return res.status(503).json({ error: 'Email library not loaded' });
  if (!email.isEmailConfigured()) return res.status(503).json({ error: 'SMTP not configured — add SMTP_HOST, SMTP_USER, SMTP_PASS to env vars' });
  const to = req.body.to || process.env.SMTP_USER;
  if (!to) return res.status(400).json({ error: 'No recipient — pass { to: "email@example.com" } or set SMTP_USER' });
  try {
    await email.sendMail({
      to,
      subject: 'Atrya email test ✓',
      html: `<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#04060e;color:#e2eaf8;border-radius:12px;">
        <div style="font-size:22px;font-weight:600;margin-bottom:12px;">Email is working ✓</div>
        <p style="color:rgba(226,234,248,.6);margin:0;">This test was sent from the Atrya admin panel at ${new Date().toISOString()}.</p>
        <p style="color:rgba(226,234,248,.6);margin-top:12px 0 0;">SMTP host: <code>${process.env.SMTP_HOST}</code></p>
      </div>`,
    });
    res.json({ ok: true, to });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Google Calendar OAuth ────────────────────────────────────────────────────

app.get('/api/booking/auth', (req, res) => {
  if (!cal) return res.status(500).json({ error: 'Calendar lib not available' });
  try {
    const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${base}/api/booking/auth/callback`;
    const state = req.query.interviewer || '';
    const url = cal.getOAuthUrl(redirectUri, state);
    res.redirect(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/booking/auth/callback', async (req, res) => {
  const { code, error } = req.query;
  const style = `<style>*{box-sizing:border-box;}body{font-family:sans-serif;padding:48px 40px;background:#04060e;color:#e2eaf8;max-width:640px;margin:0 auto;}
    h1{font-size:24px;margin:0 0 8px;}p{color:#9aaac0;font-size:14px;margin:0 0 16px;line-height:1.6;}
    .token{background:#0d1f3c;border:1px solid rgba(79,168,255,.25);padding:16px 20px;border-radius:10px;
      word-break:break-all;font-family:monospace;font-size:13px;color:#7dd3fc;margin:16px 0;cursor:pointer;position:relative;}
    .token:hover{border-color:rgba(79,168,255,.5);}
    .copy-hint{font-size:11px;color:rgba(79,168,255,.5);margin-top:6px;}
    .step{background:#111827;border:1px solid rgba(226,234,248,.07);border-radius:8px;padding:14px 18px;margin-bottom:10px;font-size:13px;}
    .step strong{color:#e2eaf8;}
    .err{color:#f87171;background:#1f0a0a;border:1px solid rgba(248,113,113,.2);padding:14px 18px;border-radius:8px;font-size:13px;}
  </style>`;

  if (error) return res.send(`<!DOCTYPE html><html><head><title>Auth Error</title>${style}</head><body>
    <h1 style="color:#f87171">Auth error</h1><div class="err">${error}: ${req.query.error_description || ''}</div>
    <p style="margin-top:16px;"><a href="/api/booking/auth" style="color:#4FA8FF;">Try again</a></p>
  </body></html>`);

  if (!code) return res.send(`<!DOCTYPE html><html><head><title>No Code</title>${style}</head><body>
    <h1 style="color:#f87171">No code received</h1><p>Google did not return an auth code. <a href="/api/booking/auth" style="color:#4FA8FF;">Try again</a></p>
  </body></html>`);

  // Auto-exchange the code for tokens right here
  const interviewerId = req.query.state || '';
  try {
    const base   = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const redir  = `${base}/api/booking/auth/callback`;
    const tokens = await cal.exchangeCodeForTokens(code, redir);
    const rt     = tokens.refresh_token;

    if (!rt) return res.send(`<!DOCTYPE html><html><head><title>No Refresh Token</title>${style}</head><body>
      <h1 style="color:#f87171">No refresh token returned</h1>
      <p>Google only returns a refresh token on the <strong>first</strong> authorisation. Go to
      <a href="https://myaccount.google.com/permissions" target="_blank" style="color:#4FA8FF;">myaccount.google.com/permissions</a>,
      revoke Atrya's access, then <a href="/api/booking/auth${interviewerId ? '?interviewer=' + interviewerId : ''}" style="color:#4FA8FF;">try again</a>.</p>
    </body></html>`);

    // Save token to interviewer record if this was a per-interviewer connect
    let savedFor = null;
    if (interviewerId) {
      const ivs = readData('interviewers') || [];
      const idx = ivs.findIndex(iv => iv.id === interviewerId);
      if (idx >= 0) {
        ivs[idx].refreshToken = rt;
        writeData('interviewers', ivs);
        savedFor = ivs[idx].name;
        console.log(`[calendar] token saved for interviewer: ${interviewerId}`);
      }
    } else {
      console.log('[calendar] refresh token obtained (global):', rt);
    }

    const successMsg = savedFor
      ? `<h1 style="color:#4FA8FF">&#10003; ${savedFor}'s calendar connected</h1><p>Token saved automatically — no further steps needed.</p>`
      : `<h1 style="color:#4FA8FF">&#10003; Google Calendar connected</h1>
         <p>Copy the refresh token below and add it to Railway as <strong>GOOGLE_REFRESH_TOKEN</strong>.</p>
         <div class="token" onclick="navigator.clipboard.writeText(this.dataset.v);this.style.borderColor='#22c55e';this.querySelector('.copy-hint').textContent='Copied!'" data-v="${rt}">${rt}<div class="copy-hint">Click to copy</div></div>
         <div class="step"><strong>1.</strong> Go to Railway → your service → Variables</div>
         <div class="step"><strong>2.</strong> Add <strong>GOOGLE_REFRESH_TOKEN</strong> = <em>the value above</em></div>
         <div class="step"><strong>3.</strong> Railway will redeploy automatically — calendar sync is live</div>`;

    res.send(`<!DOCTYPE html><html><head><title>Calendar Connected</title>${style}</head><body>
      ${successMsg}
      <p style="margin-top:24px;"><a href="/internal-829163047258/" style="color:#4FA8FF;">← Back to admin</a></p>
    </body></html>`);
  } catch (err) {
    const detail = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
    const clientIdHint = (process.env.GOOGLE_CLIENT_ID || '').slice(0, 24) + '...';
    const redirectUsed = `${process.env.BASE_URL || req.protocol + '://' + req.get('host')}/api/booking/auth/callback`;
    console.error('[calendar] exchange error:', detail);
    res.send(`<!DOCTYPE html><html><head><title>Exchange Failed</title>${style}</head><body>
      <h1 style="color:#f87171">Token exchange failed</h1>
      <div class="err" style="white-space:pre-wrap">${detail}</div>
      <p style="margin-top:16px;color:#9aaac0;font-size:13px;">Client ID prefix: <code style="color:#e2eaf8">${clientIdHint}</code></p>
      <p style="color:#9aaac0;font-size:13px;">Redirect URI used: <code style="color:#e2eaf8">${redirectUsed}</code></p>
      <p style="margin-top:16px;"><a href="/api/booking/auth" style="color:#4FA8FF;">Try again</a></p>
    </body></html>`);
  }
});

app.post('/api/booking/auth/exchange', requireAuth, async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  if (!cal)  return res.status(500).json({ error: 'Calendar lib not available' });
  try {
    const base  = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const redir = redirectUri || `${base}/api/booking/auth/callback`;
    const tokens = await cal.exchangeCodeForTokens(code, redir);
    res.json({
      message:       'Set GOOGLE_REFRESH_TOKEN to this value in your Railway env vars',
      refresh_token: tokens.refresh_token,
      access_token:  tokens.access_token ? '[received]' : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Clean URL routes ─────────────────────────────────────────────────────────

app.get('/agentic',        (_req, res) => res.sendFile(path.join(ROOT, 'agentic.html')));
app.get('/cross-border',  (_req, res) => res.sendFile(path.join(ROOT, 'cross-border.html')));
app.get('/investors',     (_req, res) => res.sendFile(path.join(ROOT, 'investors.html')));
app.get('/investors-v2',  (_req, res) => res.sendFile(path.join(ROOT, 'investors-v2.html')));
app.get('/schedule',      (_req, res) => res.sendFile(path.join(ROOT, 'schedule.html')));

// ─── Fallback ─────────────────────────────────────────────────────────────────

app.get('*', (_req, res) => res.sendFile(path.join(ROOT, 'index.html')));

// ─── Init ─────────────────────────────────────────────────────────────────────

ensureDataDir();

// Seed data on first run; force-reseed users if still holding the placeholder hash
['interviewers', 'bookings', 'settings'].forEach(name => readData(name));
(function seedUsers() {
  const seed = path.join(ROOT, 'seeds', 'users.seed.json');
  const file = dataPath('users');
  const raw  = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '[]';
  const users = JSON.parse(raw);
  const needsReseed = users.some(u => u.passwordHash && u.passwordHash.includes('placeholder'));
  if (needsReseed || !fs.existsSync(file)) {
    const fresh = JSON.parse(fs.readFileSync(seed, 'utf8'));
    writeData('users', fresh);
    console.log('[atrya] users re-seeded (placeholder hash replaced)');
  }
})();

// ── Startup migrations ────────────────────────────────────────────────────────
(function runMigrations() {
  try {
    const ivs = readData('interviewers') || [];
    let dirty = false;
    // Correct wrong placeholder photo for Phil
    const phil = ivs.find(i => i.id === 'phil');
    if (phil && phil.photo === '/benjamin-james.jpg') {
      phil.photo = '/phil-carstensen.JPG';
      dirty = true;
    }
    if (dirty) writeData('interviewers', ivs);
  } catch (e) {
    console.warn('[atrya] migration warning:', e.message);
  }
})();

app.listen(PORT, () => {
  const calCfg = cal?.getConfig() || {};
  console.log(`[atrya] listening on :${PORT}`);
  console.log(`[atrya] calendar: ${calCfg.configured ? 'configured ✓' : 'not configured (mock mode)'}`);
  console.log(`[atrya] email: ${email?.isEmailConfigured() ? 'configured ✓' : 'not configured (skipping sends)'}`);
});
