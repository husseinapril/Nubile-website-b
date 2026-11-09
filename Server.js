require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Env validation (fail fast) ----------
const REQUIRED_ENV = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing env vars:', missing.join(', '));
  console.error('   Copy .env.example → .env and fill in the values.');
  process.exit(1);
}

// ---------- Middleware ----------
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- In-memory stores (replace with Redis/DB in prod) ----------
const codes = new Map();     // email → { code, createdAt, expiresAt, attempts }
const sessions = new Map();  // token → { email, expiresAt }

const CODE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 45 * 1000;

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, r] of codes) if (now > r.expiresAt) codes.delete(email);
  for (const [token, s] of sessions) if (now > s.expiresAt) sessions.delete(token);
}, 5 * 60 * 1000);

// ---------- Nodemailer ----------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

transporter.verify((err) => {
  if (err) {
    console.error('❌ SMTP error:', err.message);
    console.error('   Check SMTP_HOST / SMTP_USER / SMTP_PASS in .env');
  } else {
    console.log('✅ SMTP ready');
  }
});

// ---------- Helpers ----------
const isValidEmail = (e) =>
  typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.toLowerCase());

const generateCode = () => String(crypto.randomInt(100000, 999999));

// Safe comparison — never throws
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// ---------- Email template ----------
function verificationEmailHTML(code) {
  return `
  <div style="font-family:Arial,sans-serif;background:#05080f;padding:48px 24px;color:#e8f4ff;">
    <div style="max-width:560px;margin:0 auto;background:#0d1526;
         border:1px solid rgba(0,255,200,.2);border-radius:16px;padding:40px;">
      <div style="margin-bottom:32px;">
        <span style="font-size:22px;font-weight:700;color:#00ffc8;">Nubile</span>
        <span style="font-size:22px;font-weight:700;color:#e8f4ff;">Business</span>
      </div>
      <h2 style="font-size:24px;margin:0 0 16px;color:#e8f4ff;">
        Your secure access code
      </h2>
      <p style="color:#7a8ba3;line-height:1.6;margin:0 0 32px;">
        Enter this 6-digit code to complete your login. It expires in 10 minutes.
      </p>
      <div style="background:#05080f;border:1px solid rgba(0,255,200,.3);
           border-radius:12px;padding:32px;text-align:center;margin-bottom:32px;">
        <div style="font-family:Courier,monospace;font-size:42px;font-weight:600;
             letter-spacing:12px;color:#00ffc8;">${code}</div>
      </div>
      <p style="color:#7a8ba3;font-size:13px;line-height:1.6;margin:0;">
        If you didn't request this, you can safely ignore this email.
        Never share this code with anyone.
      </p>
    </div>
    <p style="text-align:center;color:#4a5c6b;font-size:12px;margin-top:24px;">
      © 2025 Nubile Business — All rights reserved.
    </p>
  </div>`;
}

// ---------- ROUTE: request code ----------
app.post('/api/request-code', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const existing = codes.get(email);
    if (existing && Date.now() - existing.createdAt < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - existing.createdAt)) / 1000
      );
      return res.status(429).json({ error: `Please wait ${wait}s before requesting again.` });
    }

    const code = generateCode();
    const now = Date.now();
    codes.set(email, {
      code,
      createdAt: now,          // ✅ FIX: was missing before
      expiresAt: now + CODE_TTL_MS,
      attempts: 0,
    });

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Nubile Business — Your login code: ${code}`,
      html: verificationEmailHTML(code),
      text: `Your Nubile Business verification code is ${code}. Expires in 10 minutes.`,
    });

    // Ethereal preview (dev only)
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('🔗 Preview email:', preview);

    console.log(`✉️  Code sent to ${email}`);
    return res.json({ ok: true, message: 'Code sent. Check your inbox.' });
  } catch (err) {
    console.error('request-code error:', err.message);
    return res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

// ---------- ROUTE: verify code ----------
app.post('/api/verify-code', (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const code = String(req.body?.code || '').trim();

    if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid email or code format.' });
    }

    const record = codes.get(email);
    if (!record) {
      return res.status(400).json({ error: 'No code found. Please request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      codes.delete(email);
      return res.status(400).json({ error: 'Code expired. Please request a new one.' });
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      codes.delete(email);
      return res.status(429).json({ error: 'Too many attempts. Request a new code.' });
    }

    record.attempts += 1;

    if (!safeCompare(record.code, code)) {  // ✅ FIX: never throws
      return res.status(401).json({
        error: 'Incorrect code.',
        attemptsLeft: MAX_ATTEMPTS - record.attempts,
      });
    }

    codes.delete(email);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { email, expiresAt: Date.now() + SESSION_TTL_MS });

    return res.json({ ok: true, token, email });
  } catch (err) {
    console.error('verify-code error:', err.message);
    return res.status(500).json({ error: 'Verification failed.' });
  }
});

// ---------- ROUTE: session check ----------
app.get('/api/me', (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token.' });

    const s = sessions.get(token);
    if (!s) return res.status(401).json({ error: 'Invalid session.' });
    if (Date.now() > s.expiresAt) {
      sessions.delete(token);
      return res.status(401).json({ error: 'Session expired.' });
    }
    return res.json({ email: s.email });
  } catch (err) {
    console.error('me error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// ---------- ROUTE: logout ----------
app.post('/api/logout', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token) sessions.delete(token);
  return res.json({ ok: true });
});

// ---------- Page routes ----------
app.get('/dashboard', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
);

// SPA fallback → home page
app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  res.status(404).json({ error: 'Not found' });
});

// ---------- Global error handler ----------
app.use((err, _req, res, _next) => {
  console.error('Unhandled:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------- Prevent crashes ----------
process.on('unhandledRejection', (r) => console.error('unhandledRejection:', r));
process.on('uncaughtException', (e) => console.error('uncaughtException:', e));

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Nubile Business running at http://localhost:${PORT}`);
});
