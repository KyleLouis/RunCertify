const router = require('express').Router();
const db = require('../db');
const auth = require('./auth_middleware');

const COLS = 'id,name,raceName,role,serviceHours,date,certificateNumber,logoUrl,signatureUrl,badgeImageUrl,themeImageUrl,runnerImageUrl,styleJson';

function vals(v) {
  return [v.id,v.name,v.raceName,v.role,v.serviceHours??null,v.date,v.certificateNumber,v.logoUrl??null,v.signatureUrl??null,v.badgeImageUrl??null,v.themeImageUrl??null,v.runnerImageUrl??null,v.styleJson??null];
}

router.get('/', auth, (req, res) => {
  const { race } = req.query;
  const rows = race
    ? db.prepare('SELECT * FROM volunteers WHERE raceName = ?').all(race)
    : db.prepare('SELECT * FROM volunteers').all();
  res.json(rows);
});

router.post('/batch', auth, (req, res) => {
  const items = req.body;
  const ins = db.prepare(`INSERT OR REPLACE INTO volunteers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  db.transaction((rows) => { for (const v of rows) ins.run(vals(v)); })(items);
  res.json({ count: items.length });
});

router.post('/', auth, (req, res) => {
  db.prepare(`INSERT OR REPLACE INTO volunteers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(vals(req.body));
  res.json(req.body);
});

router.put('/:id', auth, (req, res) => {
  const v = { ...req.body, id: req.params.id };
  db.prepare(`INSERT OR REPLACE INTO volunteers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(vals(v));
  res.json(v);
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
