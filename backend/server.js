require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { getImagePath } = require('./imageHelper');

const app = express();
app.use(cors());
// 增加 JSON body 大小限制，支持批量导入大量数据及 base64 图片
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

app.use('/api/images', express.static(getImagePath()));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/finishers', require('./routes/finishers'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/races', require('./routes/races'));
app.use('/api/ai', require('./routes/ai'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`RunCertify backend running on port ${PORT}`));
