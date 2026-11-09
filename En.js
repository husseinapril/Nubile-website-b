PORT=3000

# ---- SMTP ----
# Gmail: enable 2FA → https://myaccount.google.com/apppasswords → use the 16-char app password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# ---- OR use Ethereal for testing (no real emails, see preview URL in console) ----
# SMTP_HOST=smtp.ethereal.email
# SMTP_PORT=587
# SMTP_USER=your-ethereal-user
# SMTP_PASS=your-ethereal-pass

FROM_EMAIL="Nubile Business <no-reply@nubile.io>"
