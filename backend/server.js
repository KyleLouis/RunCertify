require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/finishers', require('./routes/finishers'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/races', require('./routes/races'));
app.use('/api/ai', require('./routes/ai'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`RunCertify backend running on port ${PORT}`));
