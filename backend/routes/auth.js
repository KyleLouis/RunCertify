const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = process.env.JWT_SECRET || 'runcertify-secret-2026';

router.post('/login', (req, res) => {
  const { account, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE account = ?').get(account);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: '账号或密码错误' });
  }
  const token = jwt.sign({ id: admin.id, account: admin.account }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});

router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(auth.slice(7), SECRET);
    res.json({ account: payload.account });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
