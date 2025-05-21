// server.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiter - batasi 5 login per IP setiap 5 menit
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi nanti.' },
});

// Route login
app.post('/login', loginLimiter, async (req, res) => {
  const { username, password, token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'reCAPTCHA tidak valid.' });
  }

  // Verifikasi reCAPTCHA ke server Google
  const secretKey = '6LcPUEIrAAAAAIi6x5tJ9bUJlYar55_lxLFmA8-N';
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await fetch(verifyURL, { method: 'POST' });
    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ success: false, message: 'Verifikasi reCAPTCHA gagal.' });
    }

    // Validasi login manual
    if (username === 'admin' && password === 'admin') {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));