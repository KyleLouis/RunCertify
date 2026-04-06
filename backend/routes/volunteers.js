const router = require('express').Router();
const db = require('../db');
const auth = require('./auth_middleware');
const { processObjectImages } = require('../imageHelper');

const COLS = 'id,name,raceName,role,serviceHours,date,certificateNumber,logoUrl,signatureUrl,badgeImageUrl,themeImageUrl,runnerImageUrl,styleJson,createdAt';
const LIST_COLS = 'id,name,raceName,role,serviceHours,date,certificateNumber,styleJson,createdAt';

function vals(v) {
  const createdAt = v.createdAt ?? db.prepare('SELECT createdAt FROM volunteers WHERE id = ?').get(v.id)?.createdAt ?? new Date().toISOString();
  return [v.id,v.name,v.raceName,v.role,v.serviceHours??null,v.date,v.certificateNumber,v.logoUrl??null,v.signatureUrl??null,v.badgeImageUrl??null,v.themeImageUrl??null,v.runnerImageUrl??null,v.styleJson??null,createdAt];
}

router.get('/', (req, res) => {
  const { race } = req.query;
  const rows = race
    ? db.prepare(`SELECT ${LIST_COLS} FROM volunteers WHERE raceName = ? ORDER BY datetime(createdAt) DESC, rowid DESC`).all(race)
    : db.prepare(`SELECT ${LIST_COLS} FROM volunteers ORDER BY datetime(createdAt) DESC, rowid DESC`).all();
  res.json(rows);
});

router.get('/search', (req, res) => {
  const { name, race } = req.query;
  let query = `SELECT * FROM volunteers WHERE name = ?`;
  let params = [name];
  if (race) {
    query += ` AND raceName = ?`;
    params.push(race);
  }
  const row = db.prepare(query).get(...params);
  if (row) {
    res.json(row);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  if (row) {
    res.json(row);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

router.post('/batch', auth, (req, res) => {
  const items = req.body.map(processObjectImages);
  const ins = db.prepare(`INSERT OR REPLACE INTO volunteers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  db.transaction((rows) => { for (const v of rows) ins.run(vals(v)); })(items);
  res.json({ count: items.length });
});

router.post('/', auth, (req, res) => {
  const item = processObjectImages(req.body);
  const saved = { ...item, createdAt: db.prepare('SELECT createdAt FROM volunteers WHERE id = ?').get(item.id)?.createdAt ?? item.createdAt ?? new Date().toISOString() };
  db.prepare(`INSERT OR REPLACE INTO volunteers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(vals(saved));
  res.json(saved);
});

router.put('/:id', auth, (req, res) => {
  const v = processObjectImages({ ...req.body, id: req.params.id });
  const saved = { ...v, createdAt: db.prepare('SELECT createdAt FROM volunteers WHERE id = ?').get(req.params.id)?.createdAt ?? v.createdAt ?? new Date().toISOString() };
  db.prepare(`INSERT OR REPLACE INTO volunteers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(vals(saved));
  res.json(saved);
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM volunteers WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.post('/batch-delete', auth, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.json({ count: 0 });
  }
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM volunteers WHERE id IN (${placeholders})`);
  stmt.run(...ids);
  res.json({ count: ids.length });
});

module.exports = router;
