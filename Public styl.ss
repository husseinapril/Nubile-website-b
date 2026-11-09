* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: #05080f;
  --panel: #0d1526;
  --neon: #00ffc8;
  --neon-2: #00b8ff;
  --text: #e8f4ff;
  --muted: #7a8ba3;
  --border: rgba(0, 255, 200, 0.15);
}

html, body { height: 100%; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  overflow-x: hidden;
}

/* Background grid */
.bg-layer {
  position: fixed; inset: 0; z-index: -2;
  background:
    radial-gradient(ellipse 800px 600px at 20% 0%, rgba(0,184,255,.15), transparent 60%),
    radial-gradient(ellipse 600px 500px at 90% 30%, rgba(0,255,200,.12), transparent 60%),
    radial-gradient(ellipse 700px 600px at 50% 100%, rgba(123,97,255,.1), transparent 60%),
    var(--bg);
}

.grid-layer {
  position: fixed; inset: 0; z-index: -1;
  background-image:
    linear-gradient(rgba(0,255,200,.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,200,.06) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  from { background-position: 0 0; }
  to { background-position: 60px 60px; }
}

/* ===== Auth layout ===== */
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.auth-wrap {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.logo-mark {
  width: 36px; height: 36px;
  border: 2px solid var(--neon);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 24px rgba(0,255,200,.4);
  position: relative;
}

.logo-mark::after {
  content: '';
  width: 14px; height: 14px;
  background: var(--neon);
  border-radius: 4px;
  box-shadow: 0 0 12px var(--neon);
}

.auth-card {
  width: 100%;
  background: linear-gradient(160deg, rgba(13,21,38,.9), rgba(5,8,15,.95));
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 44px 40px;
  box-shadow:
    0 30px 80px rgba(0,0,0,.6),
    0 0 60px rgba(0,255,200,.06);
  backdrop-filter: blur(20px);
  animation: enter .5s cubic-bezier(.2,.9,.3,1);
}

@keyframes enter {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: var(--neon);
  text-transform: uppercase;
  margin-bottom: 20px;
}

.badge::before {
  content: '';
  width: 6px; height: 6px;
  background: var(--neon);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--neon);
  animation: pulse 2s infinite;
}

@keyframes pulse { 50% { opacity: .4; } }

.auth-card h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
  line-height: 1.2;
}

.auth-card h1 .gradient {
  background: linear-gradient(135deg, var(--neon), var(--neon-2));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-desc {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 28px;
}

.auth-form label {
  display: block;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
}

.auth-form input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255,255,255,.03);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: inherit;
  font-size: 1rem;
  transition: all .2s;
  margin-bottom: 20px;
}

.auth-form input:focus {
  outline: none;
  border-color: var(--neon);
  box-shadow: 0 0 0 3px rgba(0,255,200,.1);
  background: rgba(0,255,200,.03);
}

.auth-form input::placeholder { color: #4a5c6b; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 28px;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .25s;
  text-decoration: none;
}

.btn-primary {
  background: var(--neon);
  color: #002018;
  box-shadow: 0 0 24px rgba(0,255,200,.4);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 0 40px rgba(0,255,200,.7);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: .6;
  cursor: not-allowed;
  transform: none;
}

.btn-block { width: 100%; }

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  margin-top: 12px;
  font-size: .85rem;
}

.btn-ghost:hover:not(:disabled) {
  color: var(--neon);
  border-color: var(--neon);
}

.spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.hidden { display: none !important; }

.error {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(255,80,80,.1);
  border: 1px solid rgba(255,80,80,.3);
  border-radius: 10px;
  color: #ff9b9b;
  font-size: .85rem;
  line-height: 1.5;
}

.success {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(0,255,200,.08);
  border: 1px solid rgba(0,255,200,.3);
  border-radius: 10px;
  color: var(--neon);
  font-size: .85rem;
  line-height: 1.5;
}

.auth-foot {
  margin-top: 24px;
  text-align: center;
  font-size: .75rem;
  font-family: 'JetBrains Mono', monospace;
  color: var(--muted);
  letter-spacing: .05em;
}

.auth-links {
  font-family: 'JetBrains Mono', monospace;
  font-size: .7rem;
  color: var(--muted);
  letter-spacing: .1em;
  text-transform: uppercase;
}

.status { display: inline-flex; align-items: center; gap: 8px; }

.status::before {
  content: '';
  width: 6px; height: 6px;
  background: var(--neon);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--neon);
  animation: pulse 2s infinite;
}

/* Code input */
.code-input {
  text-align: center !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 1.9rem !important;
  letter-spacing: 0.6em !important;
  padding: 18px 12px 18px 24px !important;
  font-weight: 600 !important;
  color: var(--neon) !important;
}

.timer {
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: .75rem;
  color: var(--muted);
  margin-top: 16px;
  letter-spacing: .05em;
}

.timer strong { color: var(--neon); }

@media (max-width: 480px) {
  .auth-card { padding: 32px 24px; }
  .auth-card h1 { font-size: 1.5rem; }
}
